require "prawn"

class AnnouncementsController < ApplicationController
  http_basic_authenticate_with name: "Clarisse", password: "trees", only: :new

  def new
    @announcement = Announcement.new
  end

  def index
    if params[:auto_complete]
      return render json: [].to_json if params[:q].blank?

      @meeting_announcements = Announcement.all.select{|a| a.tag_list.include?("#{params[:meeting]}")}
      @announcements = []

      while (match = FuzzyMatch.new(@meeting_announcements, read: :description).find(params[:q]))
        @announcements << match
        @meeting_announcements = @meeting_announcements - [match]
      end

      while (match = FuzzyMatch.new(@meeting_announcements, read: :tag_list).find(params[:q]))
        @announcements << match
        @meeting_announcements = @meeting_announcements - [match]
      end

      while (match = FuzzyMatch.new(@meeting_announcements, read: :title).find(params[:q]))
        @announcements << match
        @meeting_announcements = @meeting_announcements - [match]
      end

      @announcements.map! do |r|
        {
          value: r.title,
          id: r.id
        }
      end

      return render json: @announcements
    else
      @announcements = Announcement.all
    end
  end

  def create
    @announcement = Announcement.new( description: params[:announcement][:description], title: params[:announcement][:title], notes: params[:announcement][:notes] )
    @announcement.date = DateTime.parse(params[:date_entry] + " " + params[:time_entry]) if params[:date_entry].present? && params[:time_entry].present?
    @announcement.tag_list += params[:tag_entry].split('#')

    if @announcement.save
      redirect_to new_announcement_path, notice: 'New Announcement Successfully Added.'
    else
      flash[:error] = "Error Creating Announcement"
      render action: 'new'
    end
  end

  def edit
    @announcement = Announcement.find(params[:id])
  end

  def show
   @announcement = Announcement.find(params[:id])
  end

  def update
    @announcement = Announcement.find(params[:id])
    if @announcement.update_attributes(params.require(:announcement).permit(:title, :description, :date, :notes))
      redirect_to action: 'show', id: @announcement
    else
      render action: 'edit'
    end
  end

  def destroy
    Announcement.find(params[:id]).destroy
    redirect_to action: 'index'
  end

  def meeting_announcements
    render json: Announcement.all.select{|a| a.tag_list.include?(params[:meeting])}.map! do |r|
      {
        value: r.title,
        id: r.id
      }
    end
  end

  def print_announcements( category, announcements, pdf )
    if announcements.size > 0 
      pdf.pad_top(40) {
        pdf.font_size(20) {
          pdf.text category, :style => :bold
	}
      }
    end
    announcements_table = []
    announcements.each do |announce|
      if announce.date != nil
        date_table = pdf.make_table( [[announce.date.strftime( '%b' )],[announce.date.strftime( '%l:%M%P' )]], cell_style: {borders: [], padding: [0, 0, 0, 10]} ) do
	  style( row(0), size: 16 )
	  style( row(1), size: 8 )
        end
        left_table = pdf.make_table( [[ announce.date.strftime( '%e' ), date_table], [{content: 'location', colspan: 2}]], cell_style: { width: 45, borders: [] } ) do
	  style( column(0), size: 34, font_style: :bold, text_color: '828282', align: :right, padding: 0 )
	  style( row(1), size: 12, width: 40, borders: [], font_style: :italic, text_color: '000000', align: :right, padding: [0, 10, 0, 0] )
	end
      else
        left_table = pdf.make_table([['','']], cell_style: {borders: [], padding: [0, 10, 0, 0]} )
      end
      right_table = pdf.make_table( [[announce.title], [announce.description], [announce.notes] ], cell_style: {width: 450, borders: [:left], padding: [0, 0, 0, 10] } ) do
        style( row(0), font_style: :bold, size: 14 )
      end
      announcements_table.push( [ left_table, right_table ] )
    end
    if announcements.size > 0
      pdf.table( announcements_table, cell_style: { borders: [:top, :bottom], border_lines: [:dotted, :solid, :dotted, :solid], padding: [ 10, 0, 10, 0] } ) do
        style( column(0), borders:[:right, :top, :bottom], border_lines: [:dotted, :solid, :dotted, :solid] )
      end
    end
  end

  def export
    announcements = params[:ids].split(',').map{|id| Announcement.find(id)}.sort{|vn| vn.date.to_i }

    events = announcements.select{ |e| e.tag_list.include?('event') }
    engineering_opportunities = announcements.select{ |e| e.tag_list.include?('engopportunity') }
    fyis = announcements.select{ |e| e.tag_list.include?('fyi') }
    other = announcements.reject{ |e| e.tag_list.include?('event') || e.tag_list.include?('engopportunity') || e.tag_list.include?('fyi') }

    pdf = Prawn::Document.new

    print_announcements( 'EVENTS', events, pdf )
    print_announcements( 'ENGINEERING OPPORTUNITIES', engineering_opportunities, pdf )
    print_announcements( 'FYI\'S', fyis, pdf )
    print_announcements( 'OTHER', other, pdf )

    @filename = 'public/announcements_' + (0...8).map { (65 + rand(26)).chr }.join + '.pdf'
    pdf.render_file @filename

    if params[:method] == 'dl'
      send_file @filename, filename: 'announcements.pdf'
    elsif params[:method] == 'tw'
      url = "http://twitter.com/share?text=#{@filename}"
      redirect_to url
    else
      url = 'http://www.facebook.com/sharer/sharer.php?u=' + request.env['HTTP_HOST'] + '/' + @filename
      redirect_to url
    end
  end
end
