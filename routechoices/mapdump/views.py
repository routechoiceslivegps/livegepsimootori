from django.shortcuts import get_object_or_404, render

from routechoices.core.models import Competitor


def home_view(request):
    return render(
        request,
        "mapdump/home.html",
        {
            "user": request.user,
        },
    )


def user_view(request, username):
    efforts = Competitor.objects.select_related(
        "device", "event", "event__club"
    ).filter(user=request.user)
    return render(
        request,
        "mapdump/user.html",
        {
            "efforts": efforts,
            "user": request.user,
        },
    )


def effort_view(request, aid):
    effort = get_object_or_404(
        Competitor.objects.select_related("device", "event", "event__club"),
        aid=aid,
    )
    event = effort.event
    return render(
        request,
        "mapdump/effort.html",
        {
            "effort": effort,
            "event": event,
            "user": request.user,
        },
    )
