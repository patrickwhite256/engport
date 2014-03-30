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
    @announcement = DateTime.parse(params[:date_entry] + " " + params[:time_entry]) if params[:date_entry].present? && params[:time_entry].present?

    if @announcement.save
      redirect_to new_announcement_path
    else
      render action: 'new', notice: 'hey' 
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

  def export
    announcements = params[:ids].split(',').map{|id| Announcement.find(id)}

    pdf = Prawn::Document.new
    announcements.each do |announce|
      pdf.stroke_horizontal_rule
      pdf.pad(10) {
        pdf.text announce.title
        pdf.text announce.description
        pdf.text announce.notes
      }
    end

    @filename = 'public/announcements_' + (0...8).map { (65 + rand(26)).chr }.join + '.pdf'
    pdf.render_file @filename

    if params[:method] == 'dl'
      send_file @filename, filename: 'announcements.pdf'
    elsif params[:method] == 'tw'
      url = 'http://www.twitter.com/home?status=Check out the latest EngSoc announcements at: ' + request.env['HTTP_HOST'] + '/' + @filename
      redirect_to url
    else
      url = 'http://www.facebook.com/sharer/sharer.php?u=' + request.env['HTTP_HOST'] + '/' + @filename
      redirect_to url
    end
  end
end
