package com.multiaceites.repository;
import com.multiaceites.model.entity.Product; import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.jpa.repository.Lock; import org.springframework.data.jpa.repository.Query; import org.springframework.data.repository.query.Param; import java.util.*;
public interface ProductRepository extends JpaRepository<Product,Long>{
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) @Query("select p from Product p where p.id = :id") Optional<Product> findByIdForUpdate(@Param("id") Long id); List<Product> findByActivoTrue(); List<Product> findByActivoTrueAndNombreContainingIgnoreCase(String nombre); List<Product> findByActivoTrueAndStockLessThanEqual(Integer stock); }
