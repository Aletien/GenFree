"""
Chat system serializers for GenFree Network.
"""

from rest_framework import serializers
from .models import ChatRoom, ChatMessage, ChatUserActivity, MessageReport


class ChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for chat rooms."""
    
    active_users_count = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'slug', 'room_type', 'description', 'is_active',
            'is_moderated', 'allow_anonymous', 'max_message_length',
            'active_users_count', 'created_by_name', 'message_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.filter(is_approved=True).count()


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""
    
    sender_name = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    is_own_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'message_type', 'content', 'emoji_reaction', 'sender_name',
            'username', 'anonymous_name', 'is_approved', 'likes', 'reports',
            'is_own_message', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'is_approved', 'likes', 'reports', 'created_at', 'updated_at'
        ]
    
    def get_is_own_message(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat messages."""
    
    class Meta:
        model = ChatMessage
        fields = [
            'room', 'message_type', 'content', 'emoji_reaction', 'anonymous_name'
        ]
    
    def validate_content(self, value):
        """Validate message content."""
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")
        
        # Check max length based on room settings
        room = self.initial_data.get('room')
        if room and hasattr(room, 'max_message_length'):
            if len(value) > room.max_message_length:
                raise serializers.ValidationError(
                    f"Message too long. Maximum {room.max_message_length} characters."
                )
        
        return value.strip()
    
    def validate(self, attrs):
        """Validate message data."""
        room = attrs.get('room')
        message_type = attrs.get('message_type', 'text')
        
        # Check if room is active
        if room and not room.is_active:
            raise serializers.ValidationError("Chat room is not active.")
        
        # Validate emoji reactions
        if message_type == 'emoji' and not attrs.get('emoji_reaction'):
            raise serializers.ValidationError("Emoji reaction is required for emoji messages.")
        
        # Check banned words
        if room and room.banned_words:
            content = attrs.get('content', '').lower()
            banned_words = [word.strip().lower() for word in room.banned_words.split(',')]
            for word in banned_words:
                if word and word in content:
                    raise serializers.ValidationError("Message contains inappropriate content.")
        
        return attrs


class ChatUserActivitySerializer(serializers.ModelSerializer):
    """Serializer for chat user activity."""
    
    username = serializers.CharField(source='user.username', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    
    class Meta:
        model = ChatUserActivity
        fields = [
            'username', 'room_name', 'activity_type', 'timestamp', 'metadata'
        ]


class MessageReportSerializer(serializers.ModelSerializer):
    """Serializer for message reports."""
    
    reported_by_name = serializers.CharField(source='reported_by.username', read_only=True)
    message_content = serializers.CharField(source='message.content', read_only=True)
    
    class Meta:
        model = MessageReport
        fields = [
            'id', 'reason', 'description', 'reported_by_name', 'message_content',
            'is_resolved', 'resolution_note', 'created_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'is_resolved', 'resolution_note', 'created_at', 'resolved_at'
        ]


class ChatStatsSerializer(serializers.Serializer):
    """Serializer for chat statistics."""
    
    total_rooms = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    active_users = serializers.IntegerField()
    messages_today = serializers.IntegerField()
    most_active_room = serializers.CharField()
    
    # Recent activity
    recent_messages = ChatMessageSerializer(many=True)
    room_stats = serializers.ListField(child=serializers.DictField())