package com.multiaceites.repository;
import com.multiaceites.model.entity.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SucursalRepository extends JpaRepository<Sucursal,Long>{ List<Sucursal> findByActivoTrue(); }
