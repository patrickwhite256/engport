class Announcement < ActiveRecord::Base
  validate :presence_of :date
  acts_as_taggable
end
