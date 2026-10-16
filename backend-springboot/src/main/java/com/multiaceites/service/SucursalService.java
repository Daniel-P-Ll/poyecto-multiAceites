package com.multiaceites.service;

import com.multiaceites.dto.SucursalRequest;
import com.multiaceites.model.entity.Sucursal;
import com.multiaceites.model.entity.User;
import com.multiaceites.repository.SucursalRepository;
import com.multiaceites.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SucursalService {

    private static final Long EMPRESA_ID = 1L;
    private static final BigDecimal IVA_15 = new BigDecimal("15.00");
    private static final BigDecimal IVA_8 = new BigDecimal("8.00");

    private final SucursalRepository repo;
    private final UserRepository users;

    public SucursalService(SucursalRepository repo, UserRepository users) {
        this.repo = repo;
        this.users = users;
    }

    @Transactional
    public Sucursal empresa() {
        List<Sucursal> existentes = repo.findAll().stream()
                .sorted(Comparator.comparing(Sucursal::getId))
                .toList();

        Sucursal empresa = existentes.stream()
                .filter(s -> EMPRESA_ID.equals(s.getId()))
                .findFirst()
                .orElseGet(() -> crearDesdeExistente(existentes));

        boolean actualizarEmpresa = false;
        if (!empresa.isActivo()) {
            empresa.setActivo(true);
            actualizarEmpresa = true;
        }
        if (empresa.getTarifaIva() == null
                || (empresa.getTarifaIva().compareTo(IVA_15) != 0
                && empresa.getTarifaIva().compareTo(IVA_8) != 0)) {
            empresa.setTarifaIva(IVA_15);
            actualizarEmpresa = true;
        }
        if (actualizarEmpresa) {
            repo.saveAndFlush(empresa);
        }

        List<User> usuariosActualizados = new ArrayList<>();
        for (User user : users.findAll()) {
            if (user.getSucursal() != null && !EMPRESA_ID.equals(user.getSucursal().getId())) {
                user.setSucursal(empresa);
                usuariosActualizados.add(user);
            }
        }
        if (!usuariosActualizados.isEmpty()) {
            users.saveAll(usuariosActualizados);
            users.flush();
        }

        for (Sucursal sucursal : existentes) {
            if (!EMPRESA_ID.equals(sucursal.getId())) {
                repo.delete(sucursal);
            }
        }

        return empresa;
    }

    @Transactional
    public Sucursal actualizarEmpresa(SucursalRequest request) {
        Sucursal empresa = empresa();
        validarTarifaIva(request.tarifaIva());
        empresa.setNombre(request.nombre());
        empresa.setRuc(request.ruc());
        empresa.setProvincia(request.provincia());
        empresa.setCiudad(request.ciudad());
        empresa.setDireccion(request.direccion());
        empresa.setTelefono(request.telefono());
        empresa.setTarifaIva(request.tarifaIva());
        empresa.setActivo(true);
        return repo.save(empresa);
    }

    public List<Sucursal> empresaComoLista() {
        return List.of(empresa());
    }

    public BigDecimal tarifaIvaVigente() {
        Sucursal empresa = repo.findById(EMPRESA_ID).orElse(null);
        if (empresa == null) {
            empresa = empresa();
        }
        validarTarifaIva(empresa.getTarifaIva());
        return empresa.getTarifaIva();
    }

    private Sucursal crearDesdeExistente(List<Sucursal> existentes) {
        Sucursal origen = existentes.isEmpty() ? null : existentes.get(0);
        Sucursal empresa = new Sucursal();
        empresa.setId(EMPRESA_ID);
        empresa.setNombre(origen == null ? "" : origen.getNombre());
        empresa.setRuc(origen == null ? null : origen.getRuc());
        empresa.setProvincia(origen == null ? "" : origen.getProvincia());
        empresa.setCiudad(origen == null ? "" : origen.getCiudad());
        empresa.setDireccion(origen == null ? null : origen.getDireccion());
        empresa.setTelefono(origen == null ? null : origen.getTelefono());
        empresa.setTarifaIva(origen == null || origen.getTarifaIva() == null
                ? IVA_15
                : origen.getTarifaIva());
        empresa.setActivo(true);
        return repo.saveAndFlush(empresa);
    }

    private void validarTarifaIva(BigDecimal tarifaIva) {
        if (tarifaIva == null || (tarifaIva.compareTo(IVA_15) != 0 && tarifaIva.compareTo(IVA_8) != 0)) {
            throw new IllegalArgumentException("La tarifa IVA debe ser 15% u 8%");
        }
    }
}
