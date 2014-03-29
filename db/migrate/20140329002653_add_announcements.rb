class AddAnnouncements < ActiveRecord::Migration
  def change
    create_table :announcements do |t|
      t.string :description
      t.datetime :date
      t.string :title
      t.string :notes
    end
  end
end
