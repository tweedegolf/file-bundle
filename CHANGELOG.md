# Changelog

## 2016-07-18

### PostgreSQL
```sql
ALTER TABLE tg_file ADD original_name VARCHAR(255) DEFAULT NULL, ADD mime_type VARCHAR(255) DEFAULT NULL;
UPDATE tg_file SET original_name = SUBSTRING(name FROM 15);
UPDATE tg_file SET mime_type = 'image/png' WHERE SUBSTRING(original_name FROM LENGTH(original_name) - 3) = '.png';
UPDATE tg_file SET mime_type = 'image/jpeg' WHERE SUBSTRING(original_name FROM LENGTH(original_name) - 3) = '.jpg';
UPDATE tg_file SET mime_type = 'image/jpeg' WHERE SUBSTRING(original_name FROM LENGTH(original_name) - 4) = '.jpeg';
UPDATE tg_file SET mime_type = 'image/gif' WHERE SUBSTRING(original_name FROM LENGTH(original_name) - 3) = '.gif';
UPDATE tg_file SET mime_type = 'application/pdf' WHERE SUBSTRING(original_name FROM LENGTH(original_name) - 3) = '.pdf';
ALTER TABLE tg_file ALTER mime_type SET NOT NULL, ALTER mime_type DROP DEFAULT, ALTER original_name SET NOT NULL, ALTER original_name DROP DEFAULT;
```

### MySQL
```sql
ALTER TABLE tg_file ADD original_name VARCHAR(255) DEFAULT NULL, ADD mime_type VARCHAR(255) DEFAULT NULL;
UPDATE tg_file SET original_name = SUBSTRING(name FROM 14);
UPDATE tg_file SET mime_type = 'image/png' WHERE SUBSTRING(original_name FROM -4) = '.png';
UPDATE tg_file SET mime_type = 'image/jpeg' WHERE SUBSTRING(original_name FROM -4) = '.jpg';
UPDATE tg_file SET mime_type = 'image/jpeg' WHERE SUBSTRING(original_name FROM -5) = '.jpeg';
UPDATE tg_file SET mime_type = 'image/gif' WHERE SUBSTRING(original_name FROM -4) = '.gif';
UPDATE tg_file SET mime_type = 'application/pdf' WHERE SUBSTRING(original_name FROM -4) = '.pdf';
ALTER TABLE tg_file CHANGE mime_type mime_type VARCHAR(255) NOT NULL, CHANGE original_name original_name VARCHAR(255) NOT NULL;
```
