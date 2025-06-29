from django.urls import path
from . import views

urlpatterns = [
    path('', views.tweet_list, name="tweet_list"),

    # Tweet Routes
    path('create/', views.tweet_create, name='tweet_create'),
    path('<int:tweet_id>/edit/', views.tweet_edit, name='tweet_edit'),  # ✅ must come before comment routes with similar patterns
    path('<int:tweet_id>/delete/', views.tweet_delete, name='tweet_delete'),
    path('<int:tweet_id>/like/', views.like_tweet, name='like_tweet'),
    # path('profile/<string:user>', views.profile_page, name='profile_page'),

    # Comment Routes
    path('<int:tweet_id>/add/', views.add_comment, name='add_comment'),
    path('<int:tweet_id>/add/<int:parent_id>/', views.add_comment, name='reply_comment'),
    path('comment/<int:comment_id>/<str:action>/', views.comment_action, name='comment_action'),  # ✅ changed prefix to comment/

    # User Auth
    path('register/', views.register, name='register'),

    #Profile
    path('user/<str:username>/', views.profile_page, name='profile_page'),

    #follow
    path('profile/<str:username>/follow/', views.toggle_follow, name='toggle_follow'),

    #search
    path('search-users/', views.search_users, name="search_users"),
    path('ajax/search-users/', views.ajax_search_users, name='ajax_search_users'),

]
