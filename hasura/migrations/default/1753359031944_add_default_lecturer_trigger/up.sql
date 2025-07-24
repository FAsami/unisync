CREATE OR REPLACE FUNCTION "academic"."set_default_lecturer"()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lecturer_id IS NULL THEN
    SELECT teacher_id INTO NEW.lecturer_id FROM "academic"."classes" WHERE id = NEW.class_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_lecturer_id_before_insert
BEFORE INSERT ON "academic"."lectures"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_default_lecturer"();
