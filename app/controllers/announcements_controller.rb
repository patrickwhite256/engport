class AnnouncementsController < ApplicationController

  def new
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

end
