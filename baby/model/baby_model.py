
class BabyModel:

    def __init__(self):
        pass

    @staticmethod
    def get_baby_info(db, user_id):
        sql = 'select u.id,u.user_name,b.id as baby_id,b.baby_name,' \
              ' b.baby_sex,b.birthday,b.introduce' \
              ' from user u left join baby_info b on u.id = b.user_id ' \
              ' where u.id = ?'
        baby_info = db.execute(sql, (user_id,)).fetchall()
        return baby_info

    @staticmethod
    def add_baby(db, user_id, baby_name, baby_sex, birthday, introduce):
        sql = 'insert into baby_info(user_id, baby_name,' \
              'baby_sex, birthday, introduce) values (?,?,?,?,?)'
        db.execute(sql, (user_id, baby_name, baby_sex, birthday, introduce))
        db.commit()

    @staticmethod
    def get_baby_healthy(db, user_id):
        sql = 'select u.id,u.user_name,b.id as baby_id,b.baby_name,' \
              ' b.baby_sex,b.birthday,b.introduce' \
              ' from user u left join baby_info b on u.id = b.user_id ' \
              ' left join manage_healthy m on m.baby_id = b.id ' \
              ' where u.id = ?'
        baby_info = db.execute(sql, (user_id,)).fetchall()
        return baby_info

    @staticmethod
    def add_baby_diary(db, user_id, baby_id, record_date, diary):
        sql = 'insert into manage_diary (baby_id, record_date,' \
              'diary, create_by) values (?,?,?,?)'
        db.execute(sql, (baby_id, record_date, diary, user_id))
        db.commit()

    @staticmethod
    def get_baby_diary(db, user_id):
        sql = 'select * from manage_diary where create_by = ? order by record_date desc'
        baby_diary = db.execute(sql, (user_id,)).fetchall()
        return baby_diary

    @staticmethod
    def add_baby_healthy(db, user_id, baby_id, record_date,
                         weight, height, remarks):
        sql = 'insert into manage_healthy (baby_id, record_date,' \
              'weight, height, remarks, create_by) values (?,?,?,?,?,?)'
        db.execute(sql, (baby_id, record_date,
                         weight, height, remarks, user_id))
        db.commit()

    @staticmethod
    def get_baby_healthy(db, user_id):
        sql = 'select * from manage_healthy where create_by = ? order by record_date'
        baby_healthy = db.execute(sql, (user_id,)).fetchall()
        return baby_healthy

    @staticmethod
    def add_footprint(db, user_id, record_date, footprint_name,footprint_desc):
        sql = 'insert into manage_footprint (user_id, record_date, footprint_name,' \
              'footprint_desc) values (?,?,?,?)'
        db.execute(sql, (user_id, record_date, footprint_name, footprint_desc))
        db.commit()

    @staticmethod
    def get_footprint(db, user_id):
        sql = 'select * from manage_footprint where user_id = ?'
        footprint = db.execute(sql, (user_id,)).fetchall()
        return footprint

