package com.multiaceites.repository;
import com.multiaceites.model.entity.Client; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ClientRepository extends JpaRepository<Client,Long>{ Optional<Client> findByCedula(String cedula); List<Client> findByActivoTrue(); List<Client> findByActivoTrueAndCedulaContaining(String cedula); }
