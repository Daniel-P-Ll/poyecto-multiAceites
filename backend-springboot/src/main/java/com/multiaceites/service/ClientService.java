package com.multiaceites.service;

import com.multiaceites.dto.ClientRequest;
import com.multiaceites.exception.NotFoundException;
import com.multiaceites.model.entity.Client;
import com.multiaceites.repository.ClientRepository;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ClientService {

    private final ClientRepository repo;

    public ClientService(ClientRepository repo) {
        this.repo = repo;
    }

    public List<Client> all(String query) {
        String term = query == null ? "" : query.trim();
        return term.isEmpty()
                ? repo.findByActivoTrue()
                : repo.findByActivoTrueAndCedulaContainingIgnoreCase(term);
    }

    public Client one(Long id) {
        return repo.findById(id).filter(Client::isActivo)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));
    }

    public Client save(ClientRequest r) {
        if (repo.findByCedula(r.cedula()).isPresent())
            throw new IllegalArgumentException("La cédula ya está registrada");
        Client c = new Client();
        copy(c, r);
        return repo.save(c);
    }

    public Client update(Long id, ClientRequest r) {
        Client c = one(id);
        copy(c, r);
        return repo.save(c);
    }

    private void copy(Client c, ClientRequest r) {
        c.setNombre(r.nombre());
        c.setCedula(r.cedula());
        c.setCorreo(r.correo());
        c.setTelefono(r.telefono());
        c.setDireccion(r.direccion());
    }

    public void delete(Long id) {
        Client c = one(id);
        c.setActivo(false);
        repo.save(c);
    }
}