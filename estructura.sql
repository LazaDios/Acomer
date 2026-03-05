--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: comanda_estado_comanda_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.comanda_estado_comanda_enum AS ENUM (
    'Abierta',
    'Preparando',
    'Finalizada',
    'Cerrada',
    'Cancelada'
);


ALTER TYPE public.comanda_estado_comanda_enum OWNER TO postgres;

--
-- Name: roles_nombre_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roles_nombre_enum AS ENUM (
    'administrador',
    'mesonero',
    'cocinero'
);


ALTER TYPE public.roles_nombre_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comanda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comanda (
    comanda_id integer NOT NULL,
    mesa character varying NOT NULL,
    nombre_mesonero character varying NOT NULL,
    estado_comanda public.comanda_estado_comanda_enum DEFAULT 'Abierta'::public.comanda_estado_comanda_enum NOT NULL,
    total_comanda numeric(5,2) NOT NULL,
    referencia_pago character varying,
    fecha_hora_comanda timestamp without time zone DEFAULT now() NOT NULL,
    id_restaurante integer
);


ALTER TABLE public.comanda OWNER TO postgres;

--
-- Name: comanda_comanda_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comanda_comanda_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comanda_comanda_id_seq OWNER TO postgres;

--
-- Name: comanda_comanda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comanda_comanda_id_seq OWNED BY public.comanda.comanda_id;


--
-- Name: detalle_comandas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_comandas (
    id_detalle_comanda integer NOT NULL,
    cantidad integer NOT NULL,
    "precioUnitario" numeric(10,2) NOT NULL,
    subtotal numeric(10,2),
    descripcion character varying(255),
    id_restaurante integer,
    comanda_id integer,
    producto_id integer
);


ALTER TABLE public.detalle_comandas OWNER TO postgres;

--
-- Name: detalle_comandas_id_detalle_comanda_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_comandas_id_detalle_comanda_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.detalle_comandas_id_detalle_comanda_seq OWNER TO postgres;

--
-- Name: detalle_comandas_id_detalle_comanda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_comandas_id_detalle_comanda_seq OWNED BY public.detalle_comandas.id_detalle_comanda;


--
-- Name: producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto (
    id_producto integer NOT NULL,
    nombre_producto character varying NOT NULL,
    precio_producto numeric(5,2) NOT NULL,
    id_restaurante integer
);


ALTER TABLE public.producto OWNER TO postgres;

--
-- Name: producto_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producto_id_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producto_id_producto_seq OWNER TO postgres;

--
-- Name: producto_id_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producto_id_producto_seq OWNED BY public.producto.id_producto;


--
-- Name: restaurantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurantes (
    id_restaurante integer NOT NULL,
    nombre character varying NOT NULL,
    direccion character varying NOT NULL,
    telefono character varying,
    tasa_cambio numeric(10,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.restaurantes OWNER TO postgres;

--
-- Name: restaurantes_id_restaurante_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurantes_id_restaurante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.restaurantes_id_restaurante_seq OWNER TO postgres;

--
-- Name: restaurantes_id_restaurante_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurantes_id_restaurante_seq OWNED BY public.restaurantes.id_restaurante;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre public.roles_nombre_enum NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_rol_seq OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    username character varying,
    email character varying,
    google_id character varying,
    password character varying,
    nombre_completo character varying NOT NULL,
    cedula character varying,
    rol_id integer NOT NULL,
    id_restaurante integer
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: comanda comanda_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comanda ALTER COLUMN comanda_id SET DEFAULT nextval('public.comanda_comanda_id_seq'::regclass);


--
-- Name: detalle_comandas id_detalle_comanda; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_comandas ALTER COLUMN id_detalle_comanda SET DEFAULT nextval('public.detalle_comandas_id_detalle_comanda_seq'::regclass);


--
-- Name: producto id_producto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto ALTER COLUMN id_producto SET DEFAULT nextval('public.producto_id_producto_seq'::regclass);


--
-- Name: restaurantes id_restaurante; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurantes ALTER COLUMN id_restaurante SET DEFAULT nextval('public.restaurantes_id_restaurante_seq'::regclass);


--
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Name: roles PK_25f8d4161f00a1dd1cbe5068695; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_25f8d4161f00a1dd1cbe5068695" PRIMARY KEY (id_rol);


--
-- Name: restaurantes PK_2b2e55144a8f13db3cd9caf8aec; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurantes
    ADD CONSTRAINT "PK_2b2e55144a8f13db3cd9caf8aec" PRIMARY KEY (id_restaurante);


--
-- Name: detalle_comandas PK_2e17bffb57cb415b1d27aaab145; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_comandas
    ADD CONSTRAINT "PK_2e17bffb57cb415b1d27aaab145" PRIMARY KEY (id_detalle_comanda);


--
-- Name: comanda PK_6e450be788cc1bf315af9c43a15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comanda
    ADD CONSTRAINT "PK_6e450be788cc1bf315af9c43a15" PRIMARY KEY (comanda_id);


--
-- Name: usuarios PK_dfe59db369749f9042499fd8107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_dfe59db369749f9042499fd8107" PRIMARY KEY (id_usuario);


--
-- Name: producto PK_e6f07eaa38082ffd9e20e961691; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT "PK_e6f07eaa38082ffd9e20e961691" PRIMARY KEY (id_producto);


--
-- Name: usuarios UQ_446adfc18b35418aac32ae0b7b5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE (email);


--
-- Name: usuarios UQ_7297e3daa75b842415eddc76cc5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_7297e3daa75b842415eddc76cc5" UNIQUE (google_id);


--
-- Name: usuarios UQ_9f78cfde576fc28f279e2b7a9cb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_9f78cfde576fc28f279e2b7a9cb" UNIQUE (username);


--
-- Name: roles UQ_a5be7aa67e759e347b1c6464e10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE (nombre);


--
-- Name: comanda FK_144401106e7c8dacea8d637e351; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comanda
    ADD CONSTRAINT "FK_144401106e7c8dacea8d637e351" FOREIGN KEY (id_restaurante) REFERENCES public.restaurantes(id_restaurante);


--
-- Name: detalle_comandas FK_3a5f89a7809dd92873f59f5282f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_comandas
    ADD CONSTRAINT "FK_3a5f89a7809dd92873f59f5282f" FOREIGN KEY (producto_id) REFERENCES public.producto(id_producto);


--
-- Name: usuarios FK_5496b7ef4828bda85520b271334; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_5496b7ef4828bda85520b271334" FOREIGN KEY (id_restaurante) REFERENCES public.restaurantes(id_restaurante);


--
-- Name: detalle_comandas FK_665055fb1312dbd0c78d87a3156; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_comandas
    ADD CONSTRAINT "FK_665055fb1312dbd0c78d87a3156" FOREIGN KEY (comanda_id) REFERENCES public.comanda(comanda_id);


--
-- Name: usuarios FK_9e519760a660751f4fa21453d3e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_9e519760a660751f4fa21453d3e" FOREIGN KEY (rol_id) REFERENCES public.roles(id_rol);


--
-- Name: producto FK_f64d4ea0d527e48a9f66e948c5e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT "FK_f64d4ea0d527e48a9f66e948c5e" FOREIGN KEY (id_restaurante) REFERENCES public.restaurantes(id_restaurante);


--
-- PostgreSQL database dump complete
--

