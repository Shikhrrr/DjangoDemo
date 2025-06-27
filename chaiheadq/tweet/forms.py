from django import forms
from .models import Tweet, Comments
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class TweetForm(forms.ModelForm):
    class Meta:
        model = Tweet
        fields = ['text', 'photo']

class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField()
    bio = forms.CharField(widget=forms.Textarea(attrs={'rows':3}), required=False)
    profile_image = forms.ImageField(required=False)
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', 'bio', 'profile_image')

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comments 
        fields=['text']
        widgets = {
            'text': forms.Textarea(attrs={'rows': 2, 'placeholder': 'Write a comment...'})
        }