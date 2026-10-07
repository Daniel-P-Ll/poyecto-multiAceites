package com.multiaceites.repository;
import com.multiaceites.model.entity.Product; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ProductRepository extends JpaRepository<Product,Long>{ List<Product> findByActivoTrue(); List<Product> findByActivoTrueAndNombreContainingIgnoreCase(String nombre); List<Product> findByActivoTrueAndStockLessThanEqual(Integer stock); }
