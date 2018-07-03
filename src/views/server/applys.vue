<template>
  <div class="app-container">
    <div class="filter">
      <el-input @keyup.enter.native="handleFilter" style="width:200px;padding:10px" class="filter-item" placeholder="直播房间" v-model="listQuery.anchor">
      </el-input>
    订阅：<el-select v-model="listQuery.isbook" placeholder="请选择" style="width:200px;padding:10px" >
        <el-option
          v-for="item in bookstatus"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-date-picker
        v-model="listQuery.time"
        type="datetimerange"
        align="right"
        start-placeholder="申请时间"
        end-placeholder="申请时间"
        :default-time="['12:00:00', '08:00:00']">
      </el-date-picker>
      <el-date-picker
        v-model="listQuery.ptime"
        type="datetimerange"
        align="right"
        start-placeholder="直播开始时间"
        end-placeholder="直播结束日期"
        :default-time="['12:00:00', '08:00:00']">
      </el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" :label="$t('table.id')" width="65">
        <template slot-scope="scope">
          <span>{{scope.$index+1}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="直播ID">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="直播间名">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="主播ID">
        <template slot-scope="scope">
          <span>{{scope.row.anchor}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="开始直播时间">
        <template slot-scope="scope">
          <span>{{scope.row.splaytime}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="结束直播时间">
        <template slot-scope="scope">
          <span>{{scope.row.eplaytime}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="直播商品">
        <template slot-scope="scope">
          <span>{{scope.row.goodsname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="是否订阅">
        <template slot-scope="scope">
          <span><el-tag type="info">{{scope.row.isbook ===1?"订阅":"取消"}}</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="handleCreate(scope.row)" v-if="scope.row.isbook===1">添加报告
          </el-button>
          <el-button type="success" size="mini" @click="path(scope.row)" v-if="scope.row.isbook===1">查看报告
          </el-button>
          <el-button type="success" size="mini" v-if="scope.row.isbook===0">订阅
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px" style='width: 400px; margin-left:100px;'>
        <el-form-item label="观看人数" prop="watchnum" >
          <el-input type="number" v-model="temp.watchnum"></el-input>
        </el-form-item>
        <el-form-item label="直播时长(分钟)" prop="ptime" >
          <el-input type="number" v-model="temp.ptime"></el-input>
        </el-form-item>
        <el-form-item label="售出物品总数" prop="stotal" >
          <el-input type="number"  v-model="temp.stotal"></el-input>
        </el-form-item>
        <el-form-item label="售出总金额" prop="mtotal" >
          <el-input type="number" v-model="temp.mtotal"></el-input>
        </el-form-item>
        <el-form-item
            v-for="(domain, index) in temp.goods"
            :label="domain.name"
            :key="domain.id"
            :prop="'goods.' + index + '.num'"
            :rules="{
              required: true, message: '数量不能为空', trigger: 'blur'
            }"
          >
          <el-input type="number" v-model="domain.num"></el-input>
        </el-form-item>
        <el-form-item label="报告人" prop="reporter" >
          <el-input v-model="temp.reporter"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="rdesc" >
          <el-input v-model="temp.rdesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { applys, addreport } from '@/api/server'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import { parse } from 'path';

export default {
  name: 'complexTable',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        anchor:"",
        isbook: 1,
        page: 1,
        limit: 20,
        name:"",
        time:[],
        ptime:[]
      },
      temp: {
        pid: 0,
        watchnum: 0,
        ptime: 0,
        stotal: 0,
        mtotal: 0,
        reporter: "",
        rdesc: "",
        goods:[
          {num:0}
        ]
      },
      bookstatus:[
        {
          value: 0,
          label: '关闭'
        }, {
          value: 1,
          label: '订阅'
        }, 
      ],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        watchnum: [
          { required: true, message: "请输入观看人数", trigger: "blur" }
        ],
        ptime: [
          { required: true, message: "请输入直播时长", trigger: "blur" }
        ],
        ptime: [
          { required: true, message: "请输入直播时长", trigger: "blur" }
        ],
        ptime: [
          { required: true, message: "请输入直播时长", trigger: "blur" }
        ],
      },
      good:{
        id:0,
        name:"",
        reporter:0
      },
      goods:[],
      link:{
        pid:0
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      applys(this.listQuery).then(response => {
        this.list = response.data[0]
        this.total = response.data[1][0].count
        this.listLoading = false
      })
    },
    path(row){
      this.$router.push({ name: '直播报告', params: { pid: row.id} })
      // setTimeout(function(){
      //   this.$router.push({name: '直播报告',params:{ pid: row.id}});
      // },2000);
    },
    handleModifyStatus(row) {
      this.temp.id = row.id;
      if(row.isbook === 0){
        updateapply(this.temp).then(res=>{
        if(res.code === 200){
          this.getList();
           this.$notify({
            title: '成功',
            message: '订阅成功',
            type: 'success',
            duration: 2000
          })
        }
      })
      }
    },
    // resetTemp() {
    //   this.temp = {
    //     rolename: undefined,
    //     utime:""
    //   }
    // },
    handleCreate(row) {
      // console.log("row", row)
      // this.resetTemp()
      this.temp.goods = [];
      this.temp.pid = row.id
      let goodsids = row.goodids.split(",")
      let goodsname = row.goodsname.split(",")
      for(var i=0;i<goodsids.length;i++){
        this.good = {};
        this.good.id = goodsids[i]
        this.good.name = goodsname[i]
        this.temp.goods.push(this.good)
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.temp.goods = JSON.stringify(this.temp.goods);
          console.log("temp:",this.temp);
          addreport(this.temp).then(res => {
            if(res.code === 200){
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    }
  }
}
</script>
