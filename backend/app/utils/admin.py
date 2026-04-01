from functools import wraps

from flask import redirect, request, session, url_for


def admin_required(view_function):
    @wraps(view_function)
    def wrapped_view(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("admin.login", next=request.path))
        return view_function(*args, **kwargs)

    return wrapped_view
