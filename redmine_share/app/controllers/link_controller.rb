class LinkController < ApplicationController
  TERM_LEN_PUB_PROJ_MIN = 2
  AUTOCOMPLETE_NUM_MAX = 20
  AVATAR_SIZE = 16

  before_action :require_login

  def dialog
    @project_id = params[:project_id]
    @object_type = params[:object_type]
    @object_id = params[:object_id]
  end

  def share
    url = params[:url]

    proj = Project.find(params[:project_id])
    obj = find_object(params[:object_type], params[:object_id])

    raise unless authorized?(proj)

    ids = params[:recipients].split(',')
    recipients = User.active.visible.where(id: ids.flatten.compact.uniq)

    # Exclude non-members
    recipients &= proj.users unless proj.is_public

    LinkMailer.deliver(recipients, proj, obj, url, params[:comment])

    flash[:notice] = l(:share_notice_email_sent)
    redirect_to_referer_or url
  rescue
    flash[:error] = l(:share_notice_email_error)
    redirect_to_referer_or url
  end

  def autocomplete
    term = params[:term]

    proj = Project.find(params[:project_id])

    raise unless authorized?(proj)

    scope = (proj.is_public && (term.length >= TERM_LEN_PUB_PROJ_MIN)) ?
              User.all : proj.users

    users = scope.active.visible.sorted.like(term)
              .where.not(id: params[:exclude])
              .limit(AUTOCOMPLETE_NUM_MAX).to_a

    render json: users.map {|user|
      {
        value: user.name.to_s,
        label: user.name.to_s,
        id: user.id.to_s,
        avatar: avatar_image_tag(user)
      }
    }
  rescue
    render_error status: 403
  end

  def authorized?(project)
    User.current.allowed_to?({controller: 'projects', action: 'show'}, project)
  end

  def find_object(object_type, object_id)
    Object.const_get(object_type.camelcase).where(id: Array.wrap(object_id))
      .to_a.first
  rescue
    nil
  end

  def avatar_image_tag(user)
    avtr = view_context.avatar(user, size: AVATAR_SIZE.to_s)

    avtr.blank? ?
      view_context.image_tag('default.png', plugin: 'redmine_share',
                             size: AVATAR_SIZE.to_s, class: 'gravatar') :
      avtr
  end
end
