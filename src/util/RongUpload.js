/**
 * Created by Administrator on 2017/6/10 0010.
 */
import {ImageHelper} from './Utils.js'
var qiniuuploader;
var UploadImageDomain = "http://7xogjk.com1.z0.glb.clouddn.com/";
function uploadInit(uploadToken,updaloadBtn,dropEleId,conEleId,host,BeforeUpload,FileUploaded) {
    qiniuuploader && qiniuuploader.destroy();
    if (!host) host = UploadImageDomain;
    qiniuuploader = Qiniu.uploader({
        runtimes: 'html5,html4',
        browse_button: updaloadBtn,
        container: conEleId,
        drop_element: dropEleId,
        max_file_size: '100mb',//最大文件100M
        dragdrop: true,
        chunk_size: '4mb',//每次发送4M
        unique_names: true,
        uptoken:uploadToken,
        domain: host,
        get_new_uptoken: true,
        filters: {
            mime_types: [{ title: "Image files", extensions: "jpg,gif,png,jpeg,bmp" }],
            prevent_duplicates: false
        },
        multi_selection: false,
        auto_start: true,
        init: {
            'FilesAdded': function (up, files) {
            },
            'BeforeUpload': function (up, file) {
                BeforeUpload && BeforeUpload(up,file);
            },
            'UploadProgress': function (up, file) {
            },
            'UploadComplete': function () {
            },
            'FileUploaded': function (up, file, info) {
                console.log('up',up);
                console.log('file',file);
                console.log('info',info);
                info = info.replace(/'/g, "\"");
                info = JSON.parse(info);
                console.log('文件上传成功');
                FileUploaded && FileUploaded(true,file);
            },
            'Error': function (up, err, errTip) {
                console.log('文件上传失败',err);
                FileUploaded && FileUploaded(false,err);
                //updateUploadToken();
                //出错后重新获取token
                RongIMLib.RongIMClient.getInstance().getFileToken(RongIMLib.FileType.IMAGE, {
                    onSuccess:  (data) => {
                        console.log('重新获取七牛token成功',data);
                        uploadFile(data.token,updaloadBtn,dropEleId,conEleId,host,BeforeUpload,FileUploaded);
                    },
                    onError: function () {
                        console.log('重新获取七牛token失败');
                    }
                });
            }
        }
    });
}
export function uploadFile(upOptions){
    uploadInit(upOptions.token,upOptions.updaloadBtn,upOptions.dropEleId,upOptions.conEleId,upOptions.host,
        (up,file)=>{
            ImageHelper.getThumbnail(file.getNative(), 60000, function (obj, data) {
                upOptions.onPrepare && upOptions.onPrepare(data);
            });
        },
        (success,file)=>{
            if (success){
                //上传后获取文件url并生成缩略图
                ImageHelper.getThumbnail(file.getNative(), 60000, function (obj, data) {
                    //发送缩略图消息
                    RongIMLib.RongIMClient.getInstance()
                        .getFileUrl(RongIMLib.FileType.IMAGE, file.target_name, '', {
                            onSuccess: function (url) {
                                console.log('上传后的路径',url.downloadUrl);
                                upOptions.onSuccess && upOptions.onSuccess({data,downloadUrl:url.downloadUrl});
                            },
                            onError: function (err) {
                                console.log('获取上传路径失败',err);
                                upOptions.onError && upOptions.onError({data,err});

                            }
                        });
                });

            }else{
                upOptions.onError && upOptions.onError();
            }
    });
}