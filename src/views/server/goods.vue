<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="商品名称" v-model="listQuery.goodsname">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
      <!-- <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">{{$t('table.export')}}</el-button> -->
      <!-- <el-checkbox class="filter-item" style='margin-left:15px;' @change='tableKey=tableKey+1' v-model="showReviewer">{{$t('table.reviewer')}}</el-checkbox> -->
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" :label="$t('table.id')" width="65">
        <template slot-scope="scope">
          <span>{{scope.$index+1}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          <span>{{scope.row.goodsname}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="价格" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.price}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="库存" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.showshor}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="佣金" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.commission}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="亮点">
        <template slot-scope="scope">
          <span>{{scope.row.point}}</span>
        </template>
      </el-table-column>
       <el-table-column align="center" label="banner">
        <template slot-scope="scope">
          <span>{{scope.row.banner === 0?"否":"是"}}</span>
        </template>
      </el-table-column>
      <el-table-column label="主图">
        <template slot-scope="scope">
           <img class="link-type" @click="handleUpload(scope.row)" :src="scope.row.main" width="40" height="40"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="介绍图">
        <template slot-scope="scope">
          <span class="link-type" @click="handthumbsleUpload(scope.row)" v-for="thumb in scope.row.thumbs">
            <img :src="thumb" width="40" height="40" style="padding:5px"/>
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="类型">
        <template slot-scope="scope">
          <span>{{scope.row.category}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="首页分类" v-if="role==='admin'">
        <template slot-scope="scope">
          <span>{{scope.row.classifyname}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="淘宝链接">
        <template slot-scope="scope">
          <span>{{scope.row.taobaourl}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="标签">
        <template slot-scope="scope">
          <el-tag type="warning">{{scope.row.tags}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button v-if="scope.row.status!='deleted'" size="mini" type="danger" @click="handleDelete(scope.row,'deleted')">{{$t('table.delete')}}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="商品名称" prop="goodsname">
          <el-input v-model="temp.goodsname"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input type = "number" v-model="temp.price"></el-input>
        </el-form-item>
        <!-- <el-form-item label="库存" prop="storenum">
          <el-input type="number" v-model="temp.storenum"></el-input>
        </el-form-item> -->
         <el-form-item
            v-for="(item, index) in stores"
            :label="'库存'+ (index+1)"
            :key="item.key"
            prop="stores"
          >
            颜色<el-input v-model="item.color"></el-input>
            SIZE<el-input v-model="item.size"></el-input>
            数量<el-input v-model="item.num"></el-input>
            <el-button style="margin-top:20px" @click.prevent="removeStore(item)">删除</el-button>
          </el-form-item>
          <el-button style="margin-left:82px;margin-bottom:20px" @click.prevent="addstore()">增加库存类型</el-button>
        <el-form-item label="佣金" prop="commission">
          <el-input type="number" v-model="temp.commission"></el-input>
        </el-form-item>
        <el-form-item label="亮点" prop="point">
          <el-input v-model="temp.point"></el-input>
        </el-form-item>
        <el-form-item label="banner" prop="point">
          <el-select v-model="temp.banner" placeholder="请选择" style="width:200px;padding:10px" >
            <el-option
              v-for="item in bannerstatus"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="主图" prop="main">
          <el-input v-model="temp.main"></el-input>
        </el-form-item>
        <el-form-item label="介绍图" prop="thumbs">
          <el-input v-model="temp.thumbs"></el-input>
        </el-form-item>
        <el-form-item label="淘宝地址" prop="main">
          <el-input v-model="temp.taobaourl"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="category">
          <el-cascader
            expand-trigger="hover"
            :options="categorys"
            v-model="temp.category"
            :props="categoryprops">
          </el-cascader>
        </el-form-item> 
        <el-form-item label="首页类型" prop="classify" v-if="role === 'admin'">
         <el-select v-model="temp.classify" placeholder="请选择" style="width:200px;padding:10px" >
            <el-option
              v-for="item in classifyoption"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item> 
        <el-form-item label="标签" prop="tags">
          <el-select v-model="temp.tags" clearable multiple  placeholder="请选择">
            <el-option
              v-for="item in tags"
              :key="item.id"
              :label="item.tagname"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item> 
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="上传图片" :visible.sync="uploaddialogFormVisible">
      <el-form :rules="rules" ref="dialogForm" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
          <el-upload
            class="upload"
            ref="upload"
            action=""
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            accept="jpg"
            :before-upload="beforeupload" 
            :file-list="fileList"
            :auto-upload="true"
            list-type="picture">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
          <!-- <el-progress v-show="showProgress" :text-inside="true" :stroke-width="15" :percentage="percentage"></el-progress> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploaddialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="mainEdit">{{$t('table.confirm')}}</el-button>
        <!-- <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>

<script src="http://gosspublic.alicdn.com/aliyun-oss-sdk-4.4.4.min.js"></script>
<script>
import {
  goods,
  addgoods,
  editgoods,
  delgoods,
  upload,
  goodstypes
} from "@/api/server";
import waves from "@/directive/waves"; // 水波纹指令

export default {
  name: "complexTable",
  directives: {
    waves
  },
  data() {
    return {
      categoryprops: { value: "id", label: "name" },
      bannerstatus: [
        {
          value: 1,
          label: "是"
        },
        {
          value: 0,
          label: "否"
        }
      ],
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsname: ""
      },
      temp: {},
      edittemp: {},
      dialogFormVisible: false,
      uploaddialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogPvVisible: false,
      rules: {
        goodsname: [
          { required: true, message: "请输入物品名称", trigger: "blur" }
        ],
        price: [{ required: true, message: "请输入价格", trigger: "blur" }],
        // storenum: [{ required: true, message: "请输入库存", trigger: "blur" }],
        // main: [{ required: true, message: "请输入主图地址", trigger: "blur" }],
        category: [{ required: true, message: "请选择类型", trigger: "blur" }]
      },
      categorys: [],
      tags: [],
      file: {},
      fileList: [
        // {
        //   name: "food.jpeg",
        //   url: "http://topimgs.oss-cn-hangzhou.aliyuncs.com/test"
        // }
        // {
        //   name: "food2.jpeg",
        //   url:
        //     "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100"
        // }
      ],
      upload: {
        region: "oss-cn-hangzhou", //根据你买的那个区的做相应的更改
        bucket: "buket名称"
      },
      mainEditform: {
        goodsid: 0,
        goodsname: undefined,
        price: 0,
        storenum: 0,
        point: "",
        main: "",
        thumbs: "",
        category: "",
        tags: [],
        role: "",
        taobaourl: "",
        stores: []
      },
      thumsEditform: {
        goodsid: 0
      },
      uploadstatus: "",
      selectedoption: [],
      classifyoption: [],
      stores: [{ color: "白色", size: "S", num: 0 }]
    };
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: "success",
        0: "info"
      };
      return statusMap[status];
    }
    // typeFilter(type) {
    //   return calendarTypeKeyValue[type]
    // }
  },
  created() {
    this.getList();
    this.role = this.$store.getters.roles;
  },
  methods: {
    getList() {
      this.listLoading = true;
      goods(this.listQuery).then(response => {
        // console.log(response.data[0]);
        if (response.data[0].length > 0) {
          this.list = response.data[0];
        } else {
          this.list = [];
        }
        goodstypes().then(res => {
          this.categorys = res.data;
          for (let index of this.list) {
            index.thumbs === null ? [""] : index.thumbs;
            for (let item of this.categorys) {
              if (item.id === index.fid) {
                index.category = item.name + "/" + index.category;
              }
            }
          }
        });
        // this.categorys = response.data[1];
        this.classifyoption = response.data[2];
        this.classifyoption.unshift({ id: 0, name: "无" });
        this.tags = response.data[3];
        this.total = response.data[4][0].count;
        this.listLoading = false;
      });
    },
    beforeupload(file) {
      if (this.uploadstatus == "main" && this.fileList.length === 1) {
        this.$message.error("只能上传一张主图哦");
        return;
      }
      console.log("beforefile:", file);
      let param = new FormData(); // 创建form对象
      param.append("file", file, file.name); // file对象是 beforeUpload参数
      let config = {
        headers: { "Content-Type": "multipart/form-data" }
      };
      upload(param).then(res => {
        if (res.code === 200 && res.data) {
          console.log(res);
          this.file = {};
          this.file.name = res.data.name;
          this.file.url = "http://assets.v-islands.com/" + res.data.name;
          this.fileList.push(this.file);
          console.log("this.fileList:", this.fileList);
        }
      });
      return false;
    },
    handleUpload(row) {
      this.fileList = [];
      // console.log("row", row);
      this.mainEditform = Object.assign({}, row);
      this.mainEditform.goodsid = row.goodsid;
      if (this.mainEditform.tagstr) {
        this.mainEditform.tags = this.mainEditform.tagstr
          .split(",")
          .map(Number);
      } else {
        this.mainEditform.tags = [];
      }
      if (this.mainEditform.thumbs !== null)
        this.mainEditform.thumbs = this.mainEditform.thumbs.toString();
      this.uploadstatus = "main";
      this.file.name = "主图";
      if (row.main !== "") {
        this.file.url = row.main;
        this.fileList.push(this.file);
      }
      this.uploaddialogFormVisible = true;
    },
    handthumbsleUpload(row) {
      this.fileList = [];
      // console.log("row", row);
      this.mainEditform = Object.assign({}, row);
      this.mainEditform.goodsid = row.goodsid;
      if (this.mainEditform.tagstr) {
        this.mainEditform.tags = this.mainEditform.tagstr
          .split(",")
          .map(Number);
      } else {
        this.mainEditform.tags = [];
      }
      this.uploadstatus = "thumbs";
      console.log("mainEditform:", this.mainEditform);
      if (this.mainEditform.thumbs[0] !== "") {
        for (let file of this.mainEditform.thumbs) {
          this.file = {};
          this.file.name = "介绍图";
          this.file.url = file;
          this.fileList.push(this.file);
        }
      }
      console.log("filelist1:", this.fileList);
      this.uploaddialogFormVisible = true;
    },
    mainEdit() {
      if (this.fileList.length > 0) {
        if (this.uploadstatus === "main") {
          this.mainEditform.main = this.fileList[0].url;
        }
        console.log("filelist:", this.fileList);
        if (this.uploadstatus === "thumbs") {
          const thumbs = [];
          for (let i of this.fileList) {
            thumbs.push(i.url);
          }
          this.mainEditform.thumbs = thumbs.toString();
        }
      } else {
        if (this.uploadstatus === "main") {
          this.mainEditform.main = "";
        }
        console.log("filelist:", this.fileList);
        if (this.uploadstatus === "thumbs") {
          this.mainEditform.thumbs = "";
        }
      }

      console.log("mainEditform:", this.mainEditform);
      this.mainEditform.storenum = 0;
      this.mainEditform.category = this.mainEditform.cid;
      editgoods(this.mainEditform).then(res => {
        console.log("res:", res);
        if (res.code == 200) {
          this.getList();
          this.uploaddialogFormVisible = false;
          this.$notify({
            title: "成功",
            message: "更新成功",
            type: "success",
            duration: 2000
          });
        }
      });
    },
    submitUpload(file) {
      const files = document.getElementById("upload");
      console.log("uploadfile", files);
      return;
      this.$refs.upload.submit();
      console.log("file:", event.target);
      upload(event).then(res => {
        console.log("res:", res);
      });
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
      this.fileList = fileList;
    },
    handlePreview(file) {
      console.log(file);
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作成功",
        type: "success"
      });
      row.status = status;
    },
    resetTemp() {
      this.temp = {
        goodsname: undefined,
        price: 0,
        storenum: 0,
        point: "",
        main: "",
        thumbs: "",
        category: [],
        tags: [],
        banner: 0,
        taobaourl: "",
        stores: [{ color: "白色", size: "S", num: 0 }],
        classify: 0
      };
      this.stores = [{ color: "白色", size: "S", num: 0 }];
    },
    addstore() {
      this.stores.push({
        color: "白色",
        size: "S",
        num: 0
      });
      console.log(this.stores);
    },
    removeStore(item) {
      console.log("stores:", this.temp);
      var index = this.stores.indexOf(item);
      console.log("index:", index);
      if (index !== -1) {
        this.stores.splice(index, 1);
      }
      console.log("stores2:", this.stores);
    },
    handleCreate() {
      this.resetTemp();
      console.log("temp1:", this.temp);
      console.log("category:", this.categorys);
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          const addparam = Object.assign({}, this.temp);
          addparam.stores = this.stores;
          addparam.category = addparam.category[addparam.category.length - 1];
          console.log(addparam);
          addgoods(addparam).then(res => {
            if (res.code == 200) {
              this.dialogFormVisible = false;
              this.getList();
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            } else {
              this.$message.error("已存在相同的物品");
            }
          });
        }
      });
    },
    handleUpdate(row) {
      this.dialogStatus = "Edit";
      this.temp = Object.assign({}, row);
      this.temp.category = [row.fid, row.cid];
      console.log(this.temp);
      this.temp.goodsid = row.goodsid;
      if (this.temp.tagstr) {
        this.temp.tags = this.temp.tagstr.split(",").map(Number);
      } else {
        this.temp.tags = [];
      }
      this.stores = [];
      if (this.temp.storenum) {
        const arr = this.temp.storenum.split(",");
        for (const i of arr) {
          let obj = {};
          let keyarr = i.split(":");
          obj.color = keyarr[0];
          obj.size = keyarr[1];
          obj.num = keyarr[2];
          this.stores.push(obj);
        }
      }
      console.log("stores:%o", this.temp.stores);
      this.temp.thumbs = this.temp.thumbs.toString();
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          console.log("edittemp", this.temp);
          const tempData = Object.assign({}, this.temp);
          tempData.category = tempData.category[tempData.category.length - 1];
          console.log("tempData", tempData);
          tempData.stores = this.stores;
          tempData.storenum = 0;
          editgoods(tempData).then(res => {
            console.log("res:", res);
            if (res.code == 200) {
              this.getList();
              this.dialogFormVisible = false;
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
            }
          });
        }
      });
    },
    handleDelete(row) {
      this.$confirm("确定删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const goodsid = { goodsid: row.goodsid };
          delgoods(goodsid).then(res => {
            if (res.code == 200) {
              this.$notify({
                title: "成功",
                message: "删除成功",
                type: "success",
                duration: 2000
              });
              this.getList();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>
