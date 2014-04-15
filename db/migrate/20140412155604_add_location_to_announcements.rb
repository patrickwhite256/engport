class AddLocationToAnnouncements < ActiveRecord::Migration
  def change
    add_column :announcements, :location, :string
  end
end
