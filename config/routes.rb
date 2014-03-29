EngPort::Application.routes.draw do
  resources :announcements do
  	collection do
      get :export
    end
  end
end
