from curl_cffi import requests

from django.conf import settings


def get_subscriptions(order_id=None, user_email=None):
    url = "https://api.lemonsqueezy.com/v1/subscriptions"

    if order_id:
        url += f"?filter[order_id]={order_id}"

    if user_email:
        url += f"?filter[user_email]={user_email}"

    headers = {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": f"Bearer {settings.LEMONSQUEEZY_API_KEY}",
    }

    response = requests.get(url, headers=headers, timeout=10)

    if response.status_code == 200:
        return response.json()
    return None
