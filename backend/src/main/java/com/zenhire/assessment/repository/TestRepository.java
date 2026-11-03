package com.zenhire.assessment.repository;

import com.zenhire.assessment.entity.Test;
import com.zenhire.assessment.entity.TestType;
import com.zenhire.job.entity.RoleCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestRepository extends JpaRepository<Test, UUID> {

    Optional<Test> findByRoleCategory(RoleCategory roleCategory);

    Optional<Test> findByTestType(TestType testType);

    List<Test> findAllByOrderByCreatedAtAsc();
}

