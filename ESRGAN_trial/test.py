import os.path as osp
import glob
import cv2
import torch
import RRDBNet_arch as arch

print('Testing ESRGAN')
model_path = 'ESRGAN_trial/models/RRDB_ESRGAN_x4.pth'  # models/RRDB_ESRGAN_x4.pth OR models/RRDB_PSNR_x4.pth
device = torch.device('cpu')

test_img_folder = 'ESRGAN_trial/LR/*'

print('Loading model...')
model = arch.RRDBNet(3, 3, 64, 23, gc=32)
model.load_state_dict(torch.load(model_path), strict=True)
model.eval()
model = model.to(device)

print('Model path {:s}. \nTesting...'.format(model_path))

idx = 0
for path in glob.glob(test_img_folder):
    idx += 1
    base = osp.splitext(osp.basename(path))[0]
    print('Processing image {} {}'.format(idx, base))
    # read images
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    print('Image read, converting to tensor...')
    img = torch.from_numpy(img).float() / 255.0
    img = img.permute(2, 0, 1)  # equivalent to np.transpose(img[:, :, [2, 1, 0]], (2, 0, 1))
    img_LR = img.unsqueeze(0)
    img_LR = img_LR.to(device)

    print('Running model...')
    with torch.no_grad():
        output = model(img_LR).data.squeeze().float().cpu().clamp_(0, 1)
    output = output.permute(1, 2, 0)  # equivalent to np.transpose(output[[2, 1, 0], :, :], (1, 2, 0))
    output = (output * 255.0).round()
    print('Model run complete, saving output...')
    cv2.imwrite('ESRGAN_trial/results/{:s}_rlt.png'.format(base), output.cpu().numpy())
    print('Output saved.')

print('All images processed.')