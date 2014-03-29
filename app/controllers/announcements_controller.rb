require "prawn"

class AnnouncementsController < ApplicationController
  def new
    @announcement = Announcement.new
  end

  def index
    if params[:auto_complete]
      return render json: [].to_json if params[:q].blank?

      @announcements = []

      @announcements += Announcement.search do
        fulltext params[:q] do
          fields :tags
        end
      end.results.map do |r|
        {
          value: r.title,
          id: r.id
        }
      end

      @announcements += Announcement.search do
        fulltext params[:q] do
          fields :description
        end
      end.results.map do |r|
        {
          value: r.title,
          id: r.id
        }
      end

      @announcements += Announcement.search do
        fulltext params[:q] do
          fields :title
        end
      end.results.map do |r|
        {
          value: r.title,
          id: r.id
        }
      end

      return render json: @announcements.uniq 

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
    @announcements = params[:ids].split(',').map{|id| Announcement.find(id)}

    pdf = Prawn::Document.new
    @announcements.each do |announce|
      pdf.stroke_horizontal_rule
      pdf.pad(10) {
        pdf.text announce.title
        pdf.text announce.description
        pdf.text announce.notes
      }
    end
    pdf.render_file "public/export.pdf"

    send_file "public/export.pdf"
  end
end
