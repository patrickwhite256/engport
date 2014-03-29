EngPort::Application.routes.draw do
  resources :announcements do
  	collection do
      get :export
      get :meeting_announcements
    end

  end

  root controller: 'announcements', action: 'index'
end
