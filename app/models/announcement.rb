class Announcement < ActiveRecord::Base
  acts_as_taggable

  searchable do
    text :title, stored: true
    text :description, stored: true
    integer :id

    text :tags do |announcement|
      announcement.tag_list.join(" ")
    end
  end

end
