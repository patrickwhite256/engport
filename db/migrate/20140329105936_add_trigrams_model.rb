class AddTrigramsModel < ActiveRecord::Migration
  def change
    extend Fuzzily::Migration
  end
end
