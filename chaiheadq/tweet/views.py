from django.shortcuts import render
from .models import Tweet, Comments
from .forms import TweetForm, UserRegistrationForm, CommentForm
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login

# Create your views here.
def index(request):
    return render(request, 'index.html')

def tweet_list(request):
    tweets = Tweet.objects.all().order_by('-created_at')
    comment_form = CommentForm
    return render(request, 'tweet_list.html', {
            'tweets': tweets, 
            'comment_form': comment_form
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
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password1'])
            user.save()
            login(request, user)

            return redirect('tweet_list')
    else:
        form = UserRegistrationForm()
    return render(request, 'registration/register.html', {'form': form})

@login_required
def like_tweet(request, tweet_id):
    tweet = get_object_or_404(Tweet, pk=tweet_id)
    if request.user in tweet.likes.all():
        tweet.likes.remove(request.user)
    else:
        tweet.likes.add(request.user)
    return redirect('tweet_list')

@login_required
def add_comment(request, tweet_id, parent_id=None):
    tweet = get_object_or_404(Tweet, pk=tweet_id)
    parent = Comments.objects.filter(id=parent_id).first() if parent_id else None

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.parent = parent
            comment.tweet = tweet
            comment.save()
            return redirect('tweet_list')
    else:
        form = CommentForm()
    return redirect('tweet_list')

@login_required
def comment_action(request, comment_id, action):
    comment = get_object_or_404(Comments, pk=comment_id, user=request.user)

    if action == 'edit':
        if request.method == 'POST':
            form = CommentForm(request.POST, instance=comment)
            if form.is_valid():
                form.save()
                return redirect('tweet_list')
            
    elif action == 'delete':
        if request.method == 'POST':
            comment.delete()
            return redirect('tweet_list')
        
    return redirect('tweet_list')
    
