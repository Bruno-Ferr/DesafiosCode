# criar_banco.py
import sqlite3

conn = sqlite3.connect('escola.db')
cursor = conn.cursor()

cursor.executescript("""
    DROP TABLE IF EXISTS CLASS_SCHEDULE;
    DROP TABLE IF EXISTS ROOM;
    DROP TABLE IF EXISTS BUILDING;
    DROP TABLE IF EXISTS CLASS;
    DROP TABLE IF EXISTS SUBJECT;
    DROP TABLE IF EXISTS PROFESSOR;

    CREATE TABLE BUILDING (id INTEGER PRIMARY KEY, name TEXT);
    CREATE TABLE ROOM (id INTEGER PRIMARY KEY, building_id INTEGER, name TEXT);
    CREATE TABLE PROFESSOR (id INTEGER PRIMARY KEY, name TEXT);
    CREATE TABLE SUBJECT (id INTEGER PRIMARY KEY, name TEXT, professor_id INTEGER);
    CREATE TABLE CLASS (id INTEGER PRIMARY KEY, subject_id INTEGER, semester TEXT);
    CREATE TABLE CLASS_SCHEDULE (
        id INTEGER PRIMARY KEY,
        class_id INTEGER,
        room_id INTEGER,
        day_of_week TEXT,
        start_time TEXT,
        end_time TEXT
    );
""")

cursor.execute("INSERT INTO BUILDING (id, name) VALUES (1, 'Prédio Principal');")
cursor.executemany("INSERT INTO ROOM (id, building_id, name) VALUES (?, ?, ?)", 
                   [(101, 1, 'Sala 101'), (102, 1, 'Sala 102')])
# cursor.executescript("""
#     INSERT INTO BUILDING (id, name) VALUES (1, 'Prédio Principal');
#     INSERT INTO ROOM (id, building_id, name) VALUES (101, 1, 'Sala 101'), (102, 1, 'Sala 102');

#     INSERT INTO CLASS_SCHEDULE (class_id, room_id, day_of_week, start_time, end_time) VALUES
#     (1, 101, 'Segunda', '08:00', '10:00'),
#     (2, 101, 'Segunda', '10:00', '12:00'),
#     (3, 102, 'Segunda', '14:00', '16:00'),
#     (4, 101, 'Terca', '09:00', '11:00');
# """)

professors_data = [
    (1, 'Professor Girafales'),
    (2, 'Professor Chaves'),
    (3, 'Professora Clotilde')
]
cursor.executemany("INSERT INTO PROFESSOR (id, name) VALUES (?, ?)", professors_data)

subjects_data = [
    (1, 'Matemática Avançada', 1),
    (2, 'História', 2),
    (3, 'Literatura', 3),
    (4, 'Álgebra Linear', 1)
]
cursor.executemany("INSERT INTO SUBJECT (id, name, professor_id) VALUES (?, ?, ?)", subjects_data)

classes_data = [
    (1, 1, '2025-2'),
    (2, 2, '2025-2'),
    (3, 3, '2025-2'),
    (4, 4, '2025-2')  
]
cursor.executemany("INSERT INTO CLASS (id, subject_id, semester) VALUES (?, ?, ?)", classes_data)

schedule_data = [
    (1, 101, 'Segunda', '08:00', '09:50'),
    (2, 101, 'Segunda', '10:00', '12:00'),
    (3, 102, 'Segunda', '14:00', '16:00'), 
    (4, 101, 'Terca',   '09:00', '11:00') 
]
cursor.executemany("INSERT INTO CLASS_SCHEDULE (class_id, room_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)", schedule_data)
print("Dados mock inseridos com sucesso.")

conn.commit()
conn.close()
print("Banco de dados criado com sucesso e populado com dados de exemplo.")