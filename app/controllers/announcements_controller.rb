require "prawn"

class AnnouncementsController < ApplicationController
  def new
    @announcement = Announcement.new
  end

  def index
    raise
  end

  def create
  end

  def edit
  end

  def show
   @announcement = Announcement.find(1)
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
