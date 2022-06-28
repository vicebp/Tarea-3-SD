use bd1;

CREATE TABLE bd1.pacientes(
    id UUID, 
    nombre text,
    apellido text,
    rut text,
    email text,
    fecha_nacimiento text,
    PRIMARY KEY(id,rut)
);

use bd2;

CREATE TABLE bd2.recetas(
    id UUID PRIMARY KEY, 
    id_paciente UUID,
    comentario text,
    farmacos text,
    doctor text
);
