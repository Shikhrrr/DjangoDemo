
// Toggle text for collapsible sections
document.addEventListener('DOMContentLoaded', function() {
    // Handle comments toggle text
    document.querySelectorAll('[data-bs-target^="#comments-"]').forEach(btn => {
        const target = document.querySelector(btn.getAttribute('data-bs-target'));
        const toggleText = btn.querySelector('.toggle-text');
        
        target.addEventListener('show.bs.collapse', () => {
            toggleText.textContent = 'Hide';
        });
        
        target.addEventListener('hide.bs.collapse', () => {
            toggleText.textContent = 'Show';
        });
    });

    // Handle replies toggle text
    document.querySelectorAll('[data-bs-target^="#replies-"]').forEach(btn => {
        const target = document.querySelector(btn.getAttribute('data-bs-target'));
        const toggleText = btn.querySelector('.replies-toggle-text');
        
        target.addEventListener('show.bs.collapse', () => {
            toggleText.textContent = 'Hide';
        });
        
        target.addEventListener('hide.bs.collapse', () => {
            toggleText.textContent = 'Show';
        });
    });
});

// AJAX for likes
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.like-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const tweetId = this.dataset.tweetId;
            const likeBtn = this.querySelector('.like-btn');
            const likeCount = this.querySelector('.like-count');
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update like button appearance
                    const heartIcon = likeBtn.firstChild.nodeValue.trim();
                    if (data.liked) {
                        likeBtn.innerHTML = '❤️ <span class="like-count">' + data.like_count + '</span>';
                    } else {
                        likeBtn.innerHTML = '♡ <span class="like-count">' + data.like_count + '</span>';
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});

// AJAX for comments
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const commentInput = this.querySelector('input[name="text"]');
            const commentsContainer = this.closest('[id^="comments-"]').querySelector('.comments-container');
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear the input
                    commentInput.value = '';
                    
                    // Add new comment to the DOM
                    const noComments = commentsContainer.querySelector('.no-comments');
                    if (noComments) {
                        noComments.remove();
                    }
                    
                    const newComment = document.createElement('div');
                    newComment.className = 'border rounded p-2 mb-3 position-relative comment-item';
                    newComment.setAttribute('data-comment-id', data.comment_id);
                    newComment.innerHTML = `
                        <strong>${data.username}</strong>: <span class="comment-text">${data.text}</span>
                        <button class="btn btn-sm btn-link p-0 mt-1" onclick="toggleReplyForm('${data.comment_id}')">Reply</button>
                        <form method="POST" action="/reply/${data.tweet_id}/${data.comment_id}/" id="reply-form-${data.comment_id}" style="display: none;" class="mt-2 reply-form" data-comment-id="${data.comment_id}" data-tweet-id="${data.tweet_id}">
                            <input type="hidden" name="csrfmiddlewaretoken" value="${document.querySelector('[name=csrfmiddlewaretoken]').value}">
                            <div class="input-group">
                                <input type="text" name="text" class="form-control" placeholder="Write a reply...">
                                <button class="btn btn-outline-primary btn-sm" type="submit">Reply</button>
                            </div>
                        </form>
                    `;
                    
                    // Insert new comment at the beginning
                    const recentCommentsHeader = commentsContainer.querySelector('h6');
                    recentCommentsHeader.insertAdjacentElement('afterend', newComment);
                    
                    // Update comment count
                    const commentCountElement = document.querySelector(`[data-bs-target="#comments-${data.tweet_id}"]`).previousElementSibling;
                    const currentCount = parseInt(commentCountElement.textContent.match(/\d+/)[0]);
                    commentCountElement.textContent = `Comments (${currentCount + 1})`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});

// AJAX for replies
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('submit', function(e) {
        if (e.target.classList.contains('reply-form')) {
            e.preventDefault();
            
            const form = e.target;
            const formData = new FormData(form);
            const replyInput = form.querySelector('input[name="text"]');
            const commentId = form.dataset.commentId;
            
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear the input
                    replyInput.value = '';
                    
                    // Hide reply form
                    form.style.display = 'none';
                    
                    // Find or create replies container
                    let repliesContainer = document.querySelector(`#replies-${commentId}`);
                    let repliesSection = repliesContainer ? repliesContainer.closest('.mt-2') : null;
                    
                    if (!repliesSection) {
                        // Create new replies section
                        repliesSection = document.createElement('div');
                        repliesSection.className = 'mt-2';
                        repliesSection.innerHTML = `
                            <button class="btn btn-sm btn-link p-0 text-decoration-none" data-bs-toggle="collapse" data-bs-target="#replies-${commentId}" aria-expanded="false">
                                <span class="replies-toggle-text">Show</span> 1 reply
                            </button>
                            <div id="replies-${commentId}" class="collapse mt-2 replies-container" data-comment-id="${commentId}">
                            </div>
                        `;
                        form.insertAdjacentElement('afterend', repliesSection);
                        repliesContainer = repliesSection.querySelector(`#replies-${commentId}`);
                    }
                    
                    // Add new reply
                    const newReply = document.createElement('div');
                    newReply.className = 'border rounded p-2 mt-2 ms-4 reply-item';
                    newReply.setAttribute('data-reply-id', data.reply_id);
                    newReply.innerHTML = `<strong>${data.username}</strong>: <span class="reply-text">${data.text}</span>`;
                    
                    repliesContainer.appendChild(newReply);
                    
                    // Update reply count
                    const replyButton = repliesSection.querySelector('[data-bs-toggle="collapse"]');
                    const currentReplies = repliesContainer.children.length;
                    replyButton.innerHTML = `<span class="replies-toggle-text">Show</span> ${currentReplies} repl${currentReplies === 1 ? 'y' : 'ies'}`;
                    
                    // Show replies if they were hidden
                    if (!repliesContainer.classList.contains('show')) {
                        const collapse = new bootstrap.Collapse(repliesContainer, { show: true });
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
});

// AJAX for comment editing
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.edit-comment-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const commentId = this.dataset.commentId;
            const newText = formData.get('text');
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update comment text in DOM
                    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
                    const commentTextSpan = commentItem.querySelector('.comment-text');
                    commentTextSpan.textContent = data.new_text;
                    
                    // Hide edit form
                    this.style.display = 'none';
                    
                    // Show success message (optional)
                    console.log(data.message);
                } else {
                    alert(data.error || 'Error updating comment');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error updating comment');
            });
        });
    });
});

// AJAX for comment deletion
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.delete-comment-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!confirm('Are you sure you want to delete this comment?')) {
                return;
            }
            
            const formData = new FormData(this);
            const commentId = this.dataset.commentId;
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove comment from DOM with animation
                    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
                    commentItem.style.transition = 'opacity 0.3s ease';
                    commentItem.style.opacity = '0';
                    
                    setTimeout(() => {
                        commentItem.remove();
                        
                        // Check if there are no comments left
                        const commentsContainer = commentItem.closest('.comments-container');
                        const remainingComments = commentsContainer.querySelectorAll('.comment-item');
                        
                        if (remainingComments.length === 0) {
                            const noCommentsMsg = document.createElement('p');
                            noCommentsMsg.className = 'text-muted no-comments';
                            noCommentsMsg.textContent = 'No comments yet.';
                            commentsContainer.appendChild(noCommentsMsg);
                        }
                    }, 300);
                    
                    // Update comment count
                    const tweetCard = commentItem.closest('.card');
                    const commentButton = tweetCard.querySelector('[data-bs-target^="#comments-"]');
                    const commentCountMatch = commentButton.textContent.match(/\d+/);
                    if (commentCountMatch) {
                        const currentCount = parseInt(commentCountMatch[0]);
                        const newCount = Math.max(0, currentCount - 1);
                        commentButton.innerHTML = commentButton.innerHTML.replace(/\d+/, newCount);
                    }
                    
                    console.log(data.message);
                } else {
                    alert('Error deleting comment');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting comment');
            });
        });
    });
});
    const form = document.getElementById(`edit-form-${commentId}`);
    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }


function toggleReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }
}
