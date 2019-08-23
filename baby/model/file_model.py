import os
import hashlib
import time
import threading
from PIL import Image


class FileModel:

    def __init__(self, base_path):
        self.base_path = base_path
        self.upload_path = os.path.join(self.base_path, 'upload')
        self.small_path = os.path.join(self.upload_path, 'small')
        self.large_path = os.path.join(self.upload_path, 'large')
        self.square_path = os.path.join(self.upload_path, 'square')
        self.video_path = os.path.join(self.upload_path, 'video')
        self.small_size = (150, 150)
        self.large_size = (350, 350)
        self.square_kb = 1024
        self.large_kb = 512
        self.small_kb = 128
        self.video_kb = 5120
        if not os.path.exists(self.upload_path):
            os.makedirs(self.upload_path)
        if not os.path.exists(self.video_path):
            os.makedirs(self.video_path)
        if not os.path.exists(self.square_path):
            os.makedirs(self.square_path)
        if not os.path.exists(self.small_path):
            os.makedirs(self.small_path)
        if not os.path.exists(self.large_path):
            os.makedirs(self.large_path)

    @staticmethod
    def my_md5(string):
        h = hashlib.md5()
        h.update(string.encode(encoding='utf-8'))
        return h.hexdigest()

    @staticmethod
    def allowed_file(filename, img_extensions, video_extensions):
        file_type = None
        if '.' in filename and filename.rsplit('.', 1)[-1] in img_extensions:
            file_type = 0
        if '.' in filename and filename.rsplit('.', 1)[-1] in video_extensions:
            file_type = 1
        return file_type

    def upload_file(self, file, img_extensions, video_extensions):
        results = {'msg': '', 'status': '', 'filename': ''}
        file_type = self.allowed_file(file.filename, img_extensions, video_extensions)
        print(file_type)
        if file and file_type is not None:
            file_extensions = file.filename.rsplit('.', 1)[-1]
            now_time = str(time.time()).split('.')[0]
            filename = '{}-{}.{}'.format(now_time, self.my_md5(now_time), file_extensions)
            print(filename)
            try:
                file.save(os.path.join(self.upload_path, filename))
                if file_type == 0:
                    self.threading_change_image(filename)
                if file_type == 1:
                    self.threading_change_video(filename)
                results['status'] = 'success'
                results['msg'] = '上传成功'
                results['filename'] = filename
                results['file_type'] = file_type
            except OSError as e:
                results['status'] = 'error'
                results['msg'] = e
        else:
            results['status'] = 'error'
            results['msg'] = '上传文件格式异常'
        return results

    def squared_image(self, img_name):
        input_path = os.path.join(self.upload_path, img_name)
        img_input = Image.open(input_path).convert("RGB")
        width, height = img_input.size
        if width == height:
            out_path = os.path.join(self.square_path, img_name)
            img_input.save(out_path, 'png')
        else:
            if width > height:
                new_width = width
                x_large = True
            else:
                new_width = height
                x_large = False
            img_out = Image.new("RGB", (new_width, new_width), (255, 255, 255))
            for i in range(width):
                for j in range(height):
                    if x_large:
                        img_out.putpixel((i, j+int((width-height)/2)),
                                         img_input.getpixel((i, j)))
                    else:
                        img_out.putpixel((i+int((height-width)/2), j),
                                         img_input.getpixel((i, j)))
            out_path = os.path.join(self.square_path, img_name)
            img_out.save(out_path, 'png', quality=80)
            self.zip_image(out_path, max_size=self.square_kb)

    @staticmethod
    def zip_image(img_path, max_size, step=10, quality=80):
        fp_size = os.path.getsize(img_path) / 1024
        while fp_size > max_size:
            im = Image.open(img_path)
            im.save(img_path, quality=quality)
            if quality - step <= 0:
                break
            quality -= step
            fp_size = os.path.getsize(img_path) / 1024

    def change_image_small(self, img_name):
        input_path = os.path.join(self.square_path, img_name)
        img_input = Image.open(input_path).convert("RGB")
        img_out = img_input.resize(self.small_size, Image.ANTIALIAS)
        out_path = os.path.join(self.small_path, img_name)
        img_out.save(out_path, 'png', quality=80)
        self.zip_image(out_path, max_size=self.small_kb)

    def change_image_large(self, img_name):
        input_path = os.path.join(self.square_path, img_name)
        img_input = Image.open(input_path).convert("RGB")
        img_out = img_input.resize(self.large_size, Image.ANTIALIAS)
        out_path = os.path.join(self.large_path, img_name)
        img_out.save(out_path, 'png', quality=80)
        self.zip_image(out_path, max_size=self.large_kb)

    def change_image_size(self, img_name):
        # 同步变更
        self.squared_image(img_name)
        self.change_image_small(img_name)
        self.change_image_large(img_name)

    def threading_change_image(self, img_name):
        # 异步变更
        thr = threading.Thread(target=self.change_image_size(img_name))
        thr.start()

    def change_video_size(self, video_name):
        # 同步压缩
        video_path = os.path.join(self.upload_path, video_name)
        out_path = os.path.join(self.video_path, video_name)
        video_size = os.path.getsize(video_path) / 1024
        if video_size >= self.video_kb:
            try:
                compress = "ffmpeg -i {} -r 10 -pix_fmt yuv420p -vcodec libx264 -preset veryslow -profile:v baseline  -crf 23 -acodec aac -b:a 32k -strict -5 {}"\
                    .format(video_path, out_path)
                isRun = os.system(compress)
            except BaseException as e:
                print("--->", e)

    def threading_change_video(self, video_name):
        # 异步压缩
        thr = threading.Thread(target=self.change_video_size(video_name))
        thr.start()


if __name__ == '__main__':
    path = '../static'
    f = FileModel(path)
    # f.change_video_size('a2.jpg')
    list_img = os.listdir(f.upload_path)
    print(list_img)
    i = 0
    for img in list_img:
        if '.' in img and 'mp4' not in img:
            f.change_image_size(img)
            i = i+1
            print(i)

