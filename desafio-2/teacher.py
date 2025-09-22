import sqlite3

def generate_report():    
    query = """
        SELECT
            p.name AS nome_do_professor,
            SUM(strftime('%s', cs.end_time) - strftime('%s', cs.start_time)) / 3600.0 AS total_horas_semanais
        FROM
            PROFESSOR p
        JOIN
            SUBJECT s ON p.id = s.professor_id
        JOIN
            CLASS c ON s.id = c.subject_id
        JOIN
            CLASS_SCHEDULE cs ON c.id = cs.class_id
        GROUP BY
            p.id, p.name
        ORDER BY
            total_horas_semanais DESC;
    """

    conn = sqlite3.connect('escola.db')
    cursor = conn.cursor()

    cursor.execute(query)
    resultados = cursor.fetchall()
    print('Resultados da consulta:')
    print(resultados)

    conn.close()

    print("-" * 50)
    print("Relatório de Carga Horária Semanal dos Professores")
    print("-" * 50)

    if not resultados:
        print("Nenhum dado de aula encontrado para os professores.")
    else:
        for nome_professor, total_horas in resultados:
            print(f"- {nome_professor}: {total_horas:.2f} horas")

if __name__ == "__main__":
    generate_report()