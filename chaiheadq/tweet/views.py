from django.shortcuts import render
from .models import Tweet, Comments, Profile
from .forms import TweetForm, UserRegistrationForm, CommentForm
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save


# Create your views here.
def index(request):
    return render(request, 'index.html')

def tweet_list(request):
    tweets = Tweet.objects.all().order_by('-created_at')
    comment_form = CommentForm
    return render(request, 'tweet_list.html', {
            'tweets': tweets, 
            'comment_form': comment_form,
        })

@login_required
def tweet_create(request):
    if (request.method == 'POST'):
        form = TweetForm(request.POST, request.FILES)
        if form.is_valid(): 
            tweet = form.save(commit=False)
            tweet.user = request.user
            tweet.save()
            return redirect('tweet_list')
    else:
        form = TweetForm()
    return render(request, 'tweet_form.html', {'form': form})

@login_required
def tweet_edit(request, tweet_id):
    tweet = get_object_or_404(Tweet, pk=tweet_id, user = request.user)
    if request.method == 'POST':
        form = TweetForm(request.POST, request.FILES, instance=tweet)
        if form.is_valid():
            tweet = form.save(commit=False)
            tweet.user = request.user
            tweet.save()
            return redirect('tweet_list')
    else:
        form = TweetForm(instance=tweet)
    return render(request, 'tweet_form.html', {'form': form})

def tweet_delete(request, tweet_id):
    tweet = get_object_or_404(Tweet, pk=tweet_id, user = request.user)
    if request.method == 'POST':
        tweet.delete()
        return redirect('tweet_list')
    return render(request, 'tweet_confirm_delete.html', {'tweet': tweet})

def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password1'])
            user.save()

            # Update profile created via signal
            profile = user.profile
            profile.bio = form.cleaned_data.get('bio')
            profile.profile_image = form.cleaned_data.get('profile_image')
            profile.save()

            login(request, user)
            return redirect('tweet_list')
    else:
        form = UserRegistrationForm()
    return render(request, 'registration/register.html', {'form': form})


@login_required
def like_tweet(request, tweet_id):
    tweet = get_object_or_404(Tweet, id=tweet_id)
    
    # Handle the like/unlike logic
    if request.user in tweet.likes.all():
        tweet.likes.remove(request.user)
        liked = False
    else:
        tweet.likes.add(request.user)
        liked = True
    
    # Check if this is an AJAX request
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'liked': liked,
            'like_count': tweet.likes.count()
        })
    
    # Handle regular form submission (fallback)
    return redirect(request.META.get('HTTP_REFERER', 'tweet_list'))

from django.views.decorators.csrf import csrf_exempt  # if needed

@login_required
def add_comment(request, tweet_id, parent_id=None):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        tweet = get_object_or_404(Tweet, id=tweet_id)
        text = request.POST.get('text')

        if not text:
            return JsonResponse({'success': False, 'error': 'Empty comment'}, status=400)

        comment = Comments(
            user=request.user,
            tweet=tweet,
            text=text
        )

        # Handle reply (if parent_id is present)
        if parent_id:
            try:
                parent_comment = Comments.objects.get(id=parent_id, tweet=tweet)
                comment.parent = parent_comment
            except Comments.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Parent comment not found'}, status=404)

        comment.save()

        return JsonResponse({
            'success': True,
            'comment_id': comment.id,
            'username': request.user.username,
            'text': comment.text,
            'tweet_id': tweet_id,
            'parent_id': parent_id
        })

    return redirect('tweet_list')


@login_required
def comment_action(request, comment_id, action):
    comment = get_object_or_404(Comments, pk=comment_id, user=request.user)
    
    if request.method == 'POST':
        if action == 'edit':
            # Get the new text from the form
            new_text = request.POST.get('text', '').strip()
            
            if new_text:  # Only update if text is not empty
                comment.text = new_text
                comment.save()
                
                # Check if this is an AJAX request
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True,
                        'action': 'edit',
                        'comment_id': comment_id,
                        'new_text': comment.text,
                        'message': 'Comment updated successfully'
                    })
            else:
                # Handle empty text case
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'error': 'Comment text cannot be empty'
                    })
                    
        elif action == 'delete':
            comment.delete()
            
            # Check if this is an AJAX request
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'action': 'delete',
                    'comment_id': comment_id,
                    'message': 'Comment deleted successfully'
                })
    
    # Handle regular form submission (fallback) or invalid requests
    return redirect('tweet_list')

# def profile_page(request, username):
#     user_profile = get_object_or_404(User, username=username)
#     tweets = Tweet.objects.filter(user=user_profile).order_by('-created_at')

#     try:
#         profile = user_profile.profile
#     except Profile.DoesNotExist:
#         profile = Profile.objects.create(user=user_profile)

#     # Users this user is following
#     following_users = User.objects.filter(profile__in=user_profile.following.all())
#     following_profiles = Profile.objects.filter(user__in=following_users)

#     # Users who follow this user
#     follower_profiles = Profile.objects.filter(followers=user_profile)

#     return render(request, 'profile_page.html', {
#         'profile': profile,
#         'user_profile': user_profile,
#         'tweets': tweets,
#         'following_profiles': following_profiles,
#         'follower_profiles': follower_profiles,
#     })

def profile_page(request, username):
    user_profile = get_object_or_404(User, username=username)
    tweets = Tweet.objects.filter(user=user_profile).order_by('-created_at')
    try:
        profile = user_profile.profile
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=user_profile)
    
    # Users this user is following
    following_users = User.objects.filter(profile__in=user_profile.following.all())
    following_profiles = Profile.objects.filter(user__in=following_users)
    
    # Users who follow this user (corrected)
    follower_profiles = user_profile.profile.followers.all()
    
    return render(request, 'profile_page.html', {
        'profile': profile,
        'user_profile': user_profile,
        'tweets': tweets,
        'following_profiles': following_profiles,
        'follower_profiles': follower_profiles,
    })

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@login_required
def toggle_follow(request, username):
    target_user = get_object_or_404(User, username=username)
    profile = target_user.profile

    if request.user in profile.followers.all():
        profile.followers.remove(request.user)
    else:
        profile.followers.add(request.user)

    return redirect('profile_page', username=username)

def search_users(request):
    return render(request, 'search_users.html')

def ajax_search_users(request):
    query = request.GET.get('q', '')
    users = User.objects.filter(username__icontains=query)[:10]

    results = []
    for user in users:
        profile = getattr(user, 'profile', None)
        results.append({
            'username': user.username,
            'profile_image': profile.profile_image.url if profile and profile.profile_image else '',
        })

    return JsonResponse({'results': results})