package com.multiaceites.repository;
import com.multiaceites.model.entity.PriceHistory; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface PriceHistoryRepository extends JpaRepository<PriceHistory,Long>{ List<PriceHistory> findByProductoIdOrderByFechaDesc(Long productoId); }
