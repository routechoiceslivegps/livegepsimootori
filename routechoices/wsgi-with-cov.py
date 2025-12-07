import atexit
import sys
import coverage


cov = coverage.coverage()
cov.start()


def save_coverage():
    print("Saving coverage", flush=True, file=sys.stderr)
    cov.stop()
    cov.save()


atexit.register(save_coverage)
