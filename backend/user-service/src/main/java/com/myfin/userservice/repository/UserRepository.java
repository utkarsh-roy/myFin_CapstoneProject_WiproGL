package com.myfin.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.myfin.userservice.entity.User;

public interface UserRepository extends JpaRepository<User,Long>{

 User findByEmail(String email);

}
