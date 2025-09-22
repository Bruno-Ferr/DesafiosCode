import sqlite3
from collections import defaultdict

def time_to_minutes(time_str):
    """Converte uma string 'HH:MM' para um total de minutos."""
    try:
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes
    except (ValueError, AttributeError):
        return None

def minutes_to_time(total_minutes):
    """Converte um total de minutos de volta para uma string 'HH:MM'."""
    if total_minutes is None:
        return ""
    hours = total_minutes // 60
    minutes = total_minutes % 60
    return f"{hours:02d}:{minutes:02d}"

def verificar_horarios_salas():
    HORA_INICIO_MIN = time_to_minutes("08:00")
    HORA_FIM_MIN = time_to_minutes("18:00")
    DIAS_DA_SEMANA = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta']

    conn = sqlite3.connect('escola.db')
    cursor = conn.cursor()

    query = """
        SELECT
            b.name as building_name,
            r.name as room_name,
            cs.day_of_week,
            cs.start_time,
            cs.end_time
        FROM ROOM r
        JOIN BUILDING b ON r.building_id = b.id
        LEFT JOIN CLASS_SCHEDULE cs ON r.id = cs.room_id
        ORDER BY
            b.name, r.name,
            CASE cs.day_of_week
                WHEN 'Segunda' THEN 1 WHEN 'Terca' THEN 2 WHEN 'Quarta' THEN 3
                WHEN 'Quinta' THEN 4 WHEN 'Sexta' THEN 5 ELSE 6
            END,
            cs.start_time;
    """
    cursor.execute(query)
    schedules = cursor.fetchall()
    conn.close()

    salas_ocupadas = defaultdict(lambda: defaultdict(list))
    for building, room, day, start_str, end_str in schedules:
        if day:
            sala_id = f"{building} - {room}"
            start_min = time_to_minutes(start_str)
            end_min = time_to_minutes(end_str)
            if start_min is not None and end_min is not None:
                salas_ocupadas[sala_id][day].append((start_min, end_min))

    conn = sqlite3.connect('escola.db')
    cursor = conn.cursor()
    cursor.execute("SELECT b.name, r.name FROM ROOM r JOIN BUILDING b ON r.building_id = b.id")
    todas_as_salas = [f"{b_name} - {r_name}" for b_name, r_name in cursor.fetchall()]
    conn.close()

    for sala_id in sorted(todas_as_salas):
        print("-" * 50)
        print(f"Horários para: {sala_id}")
        print("-" * 50)

        for dia in DIAS_DA_SEMANA:
            print(f"\n  >> {dia}:")
            horarios_do_dia = sorted(salas_ocupadas[sala_id][dia])
            
            cursor_minutos = HORA_INICIO_MIN

            if not horarios_do_dia:
                print(f"    [LIVRE] de {minutes_to_time(HORA_INICIO_MIN)} às {minutes_to_time(HORA_FIM_MIN)}")
                continue

            for inicio_ocupado_min, fim_ocupado_min in horarios_do_dia:
                if inicio_ocupado_min > cursor_minutos:
                    print(f"    [LIVRE]   de {minutes_to_time(cursor_minutos)} às {minutes_to_time(inicio_ocupado_min)}")
                
                print(f"    [OCUPADO] de {minutes_to_time(inicio_ocupado_min)} às {minutes_to_time(fim_ocupado_min)}")
                
                cursor_minutos = fim_ocupado_min
            
            if cursor_minutos < HORA_FIM_MIN:
                print(f"    [LIVRE]   de {minutes_to_time(cursor_minutos)} às {minutes_to_time(HORA_FIM_MIN)}")

if __name__ == "__main__":
    verificar_horarios_salas()