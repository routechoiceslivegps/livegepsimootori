from django.forms import (
    CharField,
    Form,
    Textarea,
)


class ContactForm(Form):
    subject = CharField(required=True, max_length=128)
    message = CharField(widget=Textarea, required=True)
