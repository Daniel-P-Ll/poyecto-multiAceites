package com.multiaceites.repository;
import com.multiaceites.model.entity.Sale; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.*;
public interface SaleRepository extends JpaRepository<Sale,Long>{
 List<Sale> findAllByOrderByFechaDesc();
 long countByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
 @Query("select coalesce(sum(v.total),0) from Sale v where v.fecha between :inicio and :fin") BigDecimal totalEntre(@Param("inicio") LocalDateTime inicio,@Param("fin") LocalDateTime fin);
}
