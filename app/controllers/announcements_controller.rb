require "prawn"

class AnnouncementsController < ApplicationController
  def new
    @announcement = Announcement.new
  end

  def index
    raise
  end

  def create
    new_announcement = Announcement.new( description: params[:announcement][:description], title: params[:announcement][:title], notes: params[:announcement][:notes] )
    new_announcement.tag_list = params[:tag_entry].split('#').reject(&:empty?)
    new_announcement.save

    redirect_to new_announcement_path
  end

  def edit
  end

  def show
   @announcement = Announcement.find(params[:id])
  end

  def update
  end

  def export
    @announcements = Announcement.all

    pdf = Prawn::Document.new
    @announcements.each do |announce|
      pdf.stroke_horizontal_rule
      pdf.pad(10) {
        pdf.text announce.title
        pdf.text announce.description
        pdf.text announce.notes
      }
    end
    pdf.render_file "app/views/announcements/export.pdf"

    send_file("app/views/announcements/export.pdf", disposition: 'inline')
  end
end
