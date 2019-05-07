module EasyGantt

  def self.non_working_week_days(user=nil)
    if user.is_a?(Integer)
      user = Principal.find_by(id: user)
    elsif user.nil?
      user = User.current
    end

    working_days = user.try(:current_working_time_calendar).try(:working_week_days)
    working_days = Array(working_days).map(&:to_i)

    if working_days.any?
      (1..7).to_a - working_days
    else
      Array(Setting.non_working_week_days).map(&:to_i)
    end
  end

  # Experimental function
  def self.load_fixed_delay?
    false
  end

  def self.easy_extensions?
    Redmine::Plugin.installed?(:easy_extensions)
  end

  def self.easy_project_com?
    Redmine::Plugin.installed?(:easy_project_com)
  end

  def self.easy_calendar?
    Redmine::Plugin.installed?(:easy_calendar)
  end

  def self.easy_attendances?
    easy_extensions? && Redmine::Plugin.installed?(:easy_attendances) && EasyAttendance.enabled?
  end

  def self.easy_money?
    Redmine::Plugin.installed?(:easy_money)
  end

  def self.easy_gantt_pro?
    Redmine::Plugin.installed?(:easy_gantt_pro)
  end

  def self.easy_gantt_resources?
    Redmine::Plugin.installed?(:easy_gantt_resources)
  end

  def self.easy_baseline?
    Redmine::Plugin.installed?(:easy_baseline)
  end

  def self.easy_printable_templates?
    Redmine::Plugin.installed?(:easy_printable_templates)
  end

  def self.combine_by_pipeline?(params)
    return false unless easy_extensions?
    return params[:combine_by_pipeline].to_s.to_boolean if params.key?(:combine_by_pipeline)
    Rails.env.production?
  end

  def self.platform
    case
    when easy_project_com?
      'easyproject'
    when easy_extensions?
      'easyredmine'
    else
      'redmine'
    end
  end

end
