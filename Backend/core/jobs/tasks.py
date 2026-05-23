from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Job, Bid

@shared_task
def send_hiring_emails(job_id, accepted_bid_id):
    try:
        job = Job.objects.get(id=job_id)
        accepted_bid = Bid.objects.get(id=accepted_bid_id)
    except (Job.DoesNotExist, Bid.DoesNotExist):
        return
        
    # Email accepted freelancer
    send_mail(
        subject=f"Congratulations! You've been hired for: {job.title}",
        message=f"Hi {accepted_bid.freelancer.first_name},\n\nGood news! You have been hired by {job.client.first_name} for the job '{job.title}'.\n\nPlease log in to Dealancer to begin work.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[accepted_bid.freelancer.email],
        fail_silently=True,
    )
    
    # Email rejected freelancers
    rejected_bids = Bid.objects.filter(job=job, status=Bid.Status.REJECTED)
    for bid in rejected_bids:
        send_mail(
            subject=f"Update on your application for: {job.title}",
            message=f"Hi {bid.freelancer.first_name},\n\nThank you for applying to '{job.title}'. We wanted to let you know that the client has decided to proceed with another candidate.\n\nKeep applying and good luck on your next proposal!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[bid.freelancer.email],
            fail_silently=True,
        )
