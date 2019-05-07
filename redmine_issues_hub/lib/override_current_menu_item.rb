# Change the application menu entry for the controllers
CalendarsController.class_eval do 
  def current_menu_item
	:issues
  end
end

GanttsController.class_eval do 
  def current_menu_item
	:issues
  end
end


