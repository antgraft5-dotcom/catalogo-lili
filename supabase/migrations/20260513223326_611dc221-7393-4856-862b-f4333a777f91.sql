
-- Enum de categorias
CREATE TYPE public.categoria_produto AS ENUM (
  'cimento','tijolos','areia','acabamento','ferramentas','hidraulica','eletrica','outros'
);

-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin');

-- Tabela user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função has_role (security definer evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Usuários veem suas próprias roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Tabela produtos
CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  categoria public.categoria_produto NOT NULL DEFAULT 'outros',
  preco numeric(10,2) NOT NULL DEFAULT 0,
  promocao boolean NOT NULL DEFAULT false,
  preco_promocional numeric(10,2),
  estoque integer NOT NULL DEFAULT 0,
  imagem text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um vê produtos ativos"
  ON public.produtos FOR SELECT
  USING (ativo = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins inserem produtos"
  ON public.produtos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam produtos"
  ON public.produtos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins excluem produtos"
  ON public.produtos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER produtos_set_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket público para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Imagens públicas de produtos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'produtos');

CREATE POLICY "Admins fazem upload de imagens"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam imagens"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins excluem imagens"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

-- Índices
CREATE INDEX idx_produtos_promocao ON public.produtos(promocao) WHERE promocao = true AND ativo = true;
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria);
