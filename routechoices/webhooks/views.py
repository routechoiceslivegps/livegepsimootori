import hashlib
import hmac
import json

from django.conf import settings
from django.core.exceptions import BadRequest
from django.http import HttpResponse, HttpResponseBadRequest
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt

from routechoices.core.models import Club
from routechoices.lib.lemonsqueezy import LEMONSQUEEZY_PREFIX


@csrf_exempt
def lemonsqueezy_webhook(request):
    digest = hmac.new(
        settings.LEMONSQUEEZY_SIGNATURE.encode("utf-8"),
        msg=request.body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    if request.META.get("HTTP_X_SIGNATURE") != digest:
        return HttpResponseBadRequest("Invalid signature")

    data = json.loads(request.body, strict=False)

    variant_id = None
    try:
        variant_id = str(
            data["data"]["attributes"].get("variant_id")
            or data["data"]["attributes"].get("first_order_item", {}).get("variant_id")
        )
    except Exception:
        pass

    # Club Upgrade
    if (
        "order_created" in request.META.get("HTTP_X_EVENT_NAME", "")
        and variant_id in settings.LEMONSQUEEZY_PRODUCTS_VARIANTS
    ):
        club = None
        try:
            order_id = str(data["data"]["attributes"]["first_order_item"]["order_id"])
        except KeyError:
            # Could not find order_id info
            raise BadRequest("Missing order id")
        try:
            slug = str(data["meta"]["custom_data"]["club"])
        except KeyError:
            pass
        else:
            club = Club.objects.filter(slug__iexact=slug).first()
        if not club:
            raise BadRequest("Missing attribute")

        club.upgraded = True
        club.upgraded_date = now()
        club.order_id = f"{LEMONSQUEEZY_PREFIX}{order_id}"
        club.save()
        return HttpResponse(f"Upgraded {club}")

    # Club Downgrade
    if (
        "subscription_expired" in request.META.get("HTTP_X_EVENT_NAME", "")
        and variant_id in settings.LEMONSQUEEZY_PRODUCTS_VARIANTS
    ):
        club = None
        try:
            order_id = str(data["data"]["attributes"]["order_id"])
        except KeyError:
            # Could not find order_id info
            raise BadRequest("Missing order id")
        club = Club.objects.filter(order_id=f"{LEMONSQUEEZY_PREFIX}{order_id}").first()
        if club:
            club.upgraded = False
            club.upgraded_date = None
            club.order_id = ""
            club.save()
            return HttpResponse(f"Downgraded {club}")

    # Club Pause
    if (
        "subscription_paused" in request.META.get("HTTP_X_EVENT_NAME", "")
        and variant_id in settings.LEMONSQUEEZY_PRODUCTS_VARIANTS
    ):
        club = None
        try:
            order_id = str(data["data"]["attributes"]["order_id"])
        except KeyError:
            # Could not find order_id info
            raise BadRequest("Missing order id")
        club = Club.objects.filter(order_id=f"{LEMONSQUEEZY_PREFIX}{order_id}").first()
        if club and data["data"]["attributes"]["pause"]["mode"] == "void":
            club.subscription_paused_at = now()
            club.save()
        return HttpResponse(f"Paused {club}")

    # Club UnPause
    if (
        "subscription_unpaused" in request.META.get("HTTP_X_EVENT_NAME", "")
        and variant_id in settings.LEMONSQUEEZY_PRODUCTS_VARIANTS
    ):
        club = None
        try:
            order_id = str(data["data"]["attributes"]["order_id"])
        except KeyError:
            # Could not find order_id info
            raise BadRequest("Missing order id")
        club = Club.objects.filter(order_id=f"{LEMONSQUEEZY_PREFIX}{order_id}").first()
        if club:
            club.subscription_paused_at = None
            club.save()
            return HttpResponse(f"Unpaused {club}")

    return HttpResponse("Valid webhook call with no action taken")
