package com.zenhire.chat.repository;

import com.zenhire.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findTop20ByCandidateIdOrderByCreatedAtDesc(UUID candidateId);

    List<ChatMessage> findAllByCandidateIdOrderByCreatedAtAsc(UUID candidateId);
}

