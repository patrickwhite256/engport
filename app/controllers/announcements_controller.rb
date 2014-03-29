require "prawn"

class AnnouncementsController < ApplicationController
  http_basic_authenticate_with name: "Clarisse", password: "trees", only: :new

  def new
    @announcement = Announcement.new
  end

  def index
    if params[:auto_complete]
      return render json: [].to_json if params[:q].blank?

      @announcements = []

      while (match = FuzzyMatch.new(Announcement.all - @announcements, read: :description).find(params[:q]))
        @announcements << match
      end

      while (match = FuzzyMatch.new(Announcement.all - @announcements, read: :tag_list).find(params[:q]))
        @announcements << match
      end

      while (match = FuzzyMatch.new(Announcement.all - @announcements, read: :title).find(params[:q]))
        @announcements << match
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
    new_announcement = Announcement.new( description: params[:announcement][:description], title: params[:announcement][:title], notes: params[:announcement][:notes] )
    new_announcement.tag_list = params[:tag_entry].split('#').reject(&:empty?)
    new_announcement.save

    redirect_to new_announcement_path
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
      puts url
      redirect_to url
    else
      url = 'http://www.facebook.com/sharer/sharer.php?u=' + request.env['HTTP_HOST'] + '/' + @filename
      redirect_to url
    end
  end
end
