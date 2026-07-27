class AlreadyInvited(Exception):
    """User has a valid, pending invitation"""



class AlreadyAccepted(Exception):
    """User has already accepted an invitation"""



class UserAlreadyAdmin(Exception):
    """This email is already registered by a site user"""

